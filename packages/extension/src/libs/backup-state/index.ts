import BrowserStorage from '../common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';
import {
  BackupData,
  BackupResponseType,
  BackupType,
  IState,
  StorageKeys,
} from './types';
import PublicKeyRing from '../keyring/public-keyring';
import sendUsingInternalMessengers from '../messenger/internal-messenger';
import { InternalMethods } from '@/types/messenger';
import EthNetwork from '@/providers/ethereum/networks/eth';
import {
  bufferToHex,
  hexToBuffer,
  NACL_VERSION,
  naclEncrypt,
} from '@enkryptcom/utils';
import { hashPersonalMessage } from '@ethereumjs/util';
import { v4 as uuidv4 } from 'uuid';
import { BACKUP_URL } from './configs';
import { EnkryptAccount, SignerType, WalletType } from '@enkryptcom/types';
import KeyRingBase from '../keyring/keyring';

class BackupState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.backupState);
  }

  async getMainWallet(): Promise<EnkryptAccount> {
    const pkr = new PublicKeyRing();
    const allAccounts = await pkr.getAccounts();
    const mainWallet = allAccounts.find(
      acc =>
        acc.walletType === 'mnemonic' &&
        acc.pathIndex === 0 &&
        acc.signerType === 'secp256k1' &&
        acc.basePath === EthNetwork.basePath,
    );
    if (!mainWallet) {
      throw new Error('No main wallet found');
    }
    return mainWallet;
  }

  async getBackups(pubkey?: string): Promise<BackupType[]> {
    if (!pubkey) {
      const mainWallet = await this.getMainWallet();
      pubkey = mainWallet.publicKey;
    }
    const rawResponse = await fetch(`${BACKUP_URL}backups/${pubkey}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const content: BackupResponseType = await rawResponse.json();
    return content.backups;
  }

  async restoreBackup(
    backup: BackupType,
    keyringPassword: string,
  ): Promise<void> {
    const mainWallet = await this.getMainWallet();
    await sendUsingInternalMessengers({
      method: InternalMethods.unlock,
      params: [keyringPassword, false],
    });
    await sendUsingInternalMessengers({
      method: InternalMethods.ethereumDecrypt,
      params: [backup.payload, mainWallet],
    }).then(async res => {
      if (res.error) {
        console.error(res);
        return null;
      } else {
        const kr = new KeyRingBase();
        await kr.unlock(keyringPassword);
        const existingAccounts = await kr.getKeysArray();
        const decryptedBackup: BackupData = JSON.parse(
          JSON.parse(res.result as string),
        );
        console.log(decryptedBackup);
        const highestPathIndex: Record<string, number> = {};
        decryptedBackup.accounts.forEach(acc => {
          const id = `${acc.basePath}###${acc.signerType}`;
          const idx = acc.pathIndex;
          if (!highestPathIndex[id] || highestPathIndex[id] < idx) {
            highestPathIndex[id] = idx;
          }
        });

        console.log(highestPathIndex);
        const getAccountByIndex = (
          accounts: Omit<EnkryptAccount, 'address' | 'publicKey'>[],
          basePath: string,
          signerType: SignerType,
          idx: number,
        ): EnkryptAccount | null => {
          for (const acc of accounts) {
            if (
              acc.basePath === basePath &&
              acc.pathIndex === idx &&
              acc.signerType === signerType
            ) {
              return acc as EnkryptAccount;
            }
          }
          return null;
        };

        for (const key of Object.keys(highestPathIndex)) {
          const [basePath, signerType] = key.split('###');
          for (let i = 0; i <= highestPathIndex[key]; i++) {
            const newAccount = getAccountByIndex(
              decryptedBackup.accounts,
              basePath,
              signerType as SignerType,
              i,
            );
            const existingAccount = getAccountByIndex(
              existingAccounts,
              basePath,
              signerType as SignerType,
              i,
            );
            if (existingAccount && newAccount) {
              console.log('Account already exists, just renaming');
              await kr.renameAccount(existingAccount.address, newAccount.name);
              continue;
            } else if (newAccount) {
              console.log('creating new account', newAccount);
              await kr.saveNewAccount({
                basePath: newAccount.basePath,
                name: newAccount.name,
                signerType: newAccount.signerType,
                walletType: newAccount.walletType,
              });
            } else if (!newAccount) {
              console.log('edge case shouldnt happen', newAccount);
              await kr.saveNewAccount({
                basePath: basePath,
                name: `New Account from backup ${i}`,
                signerType: signerType as SignerType,
                walletType: WalletType.mnemonic,
              });
            }
          }
        }
        await this.setUserId(decryptedBackup.uuid);
      }
    });
  }

  async backup(firstTime: boolean): Promise<boolean> {
    const state = await this.getState();
    if (firstTime && state.lastBackupTime !== 0) {
      return true;
    }
    const pkr = new PublicKeyRing();
    const allAccounts = await pkr.getAccounts();
    const mainWallet = await this.getMainWallet();
    const backupData: BackupData = {
      accounts: allAccounts
        .filter(
          acc => !acc.isTestWallet && acc.walletType !== WalletType.privkey,
        )
        .map(acc => {
          return {
            basePath: acc.basePath,
            pathIndex: acc.pathIndex,
            name: acc.name,
            signerType: acc.signerType,
            walletType: acc.walletType,
            isHardware: acc.isHardware,
            HWOptions: acc.HWOptions,
          };
        }),
      uuid: state.userId,
    };
    const encryptPubKey = await sendUsingInternalMessengers({
      method: InternalMethods.getEthereumEncryptionPublicKey,
      params: [mainWallet],
    }).then(res => {
      if (res.error) {
        console.error(res);
        return null;
      } else {
        return JSON.parse(res.result as string);
      }
    });
    if (!encryptPubKey) {
      console.error('No encrypt public key found');
      return false;
    }
    const encryptedStr = naclEncrypt({
      publicKey: encryptPubKey,
      data: JSON.stringify(backupData),
      version: NACL_VERSION,
    });
    const msgHash = bufferToHex(hashPersonalMessage(hexToBuffer(encryptedStr)));
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [msgHash, mainWallet],
    }).then(async res => {
      if (res.error) {
        console.error(res);
        return false;
      } else {
        const rawResponse = await fetch(
          `${BACKUP_URL}backups/${mainWallet.publicKey}/${state.userId}`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payload: encryptedStr,
              signature: JSON.parse(res.result as string),
            }),
          },
        );
        const content = await rawResponse.json();
        if (content.message === 'Ok') {
          await this.setState({
            lastBackupTime: new Date().getTime(),
            userId: state.userId,
          });
          return true;
        }
        console.error(content);
        return false;
      }
    });
  }

  async setState(state: IState): Promise<void> {
    return this.storage.set(StorageKeys.backupInfo, state);
  }

  async getState(): Promise<IState> {
    const state = await this.storage.get(StorageKeys.backupInfo);
    if (!state) {
      const newState: IState = {
        lastBackupTime: 0,
        userId: uuidv4(),
      };
      await this.setState(newState);
      return newState;
    }
    return state;
  }

  async getLastUpdatedTime(): Promise<Date> {
    const state: IState = await this.getState();
    return new Date(state.lastBackupTime);
  }

  async getUserId(): Promise<string> {
    const state: IState = await this.getState();
    return state.userId;
  }

  async setUserId(userId: string): Promise<void> {
    const state: IState = await this.getState();
    await this.setState({ ...state, userId });
  }
}

export default BackupState;
