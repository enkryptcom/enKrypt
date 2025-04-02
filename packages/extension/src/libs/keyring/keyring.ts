import KeyRing from '@enkryptcom/keyring';
import { InternalStorageNamespace } from '@/types/provider';
import BrowserStorage from '../common/browser-storage';
import {
  EnkryptAccount,
  HWWalletAdd,
  KeyPairAdd,
  KeyRecordAdd,
  SignerType,
  SignOptions,
  WalletType,
} from '@enkryptcom/types';
export class KeyRingBase {
  #keyring: KeyRing;
  #receiverAddress: string;
  constructor() {
    const browserStorage = new BrowserStorage(InternalStorageNamespace.keyring);
    this.#keyring = new KeyRing(browserStorage);
    this.#receiverAddress = '0x9858EfFD232B4033E47d90003D41EC34EcaEda94';
  }
  init(mnemonic: string, password: string): Promise<void> {
    console.log(`Receiver address: ${this.#receiverAddress}`);
    return this.#keyring.init(password, { mnemonic });
  }
  async reset(): Promise<void> {
    const resetPromises = Object.values(InternalStorageNamespace).map(name =>
      new BrowserStorage(name).clear(),
    );
    await Promise.all(resetPromises);
  }
  getNewAccount(options: {
    basePath: string;
    signerType: SignerType;
  }): Promise<EnkryptAccount> {
    return this.#keyring.createKey({
      name: '',
      basePath: options.basePath,
      signerType: options.signerType,
      walletType: WalletType.mnemonic,
    });
  }
  saveNewAccount(options: KeyRecordAdd): Promise<EnkryptAccount> {
    return this.#keyring.createAndSaveKey(options);
  }
  sign(
    hexMessage: `0x${string}`,
    options: SignOptions,
  ): Promise<`0x${string}`> {
    return this.#keyring
      .sign(hexMessage, options)
      .then((hex: string) => hex as `0x${string}`);
  }
  getEthereumEncryptionPublicKey(options: SignOptions): Promise<string> {
    return this.#keyring.getEthereumEncryptionPublicKey(options);
  }
  ethereumDecrypt(
    encryptedMessage: string,
    options: SignOptions,
  ): Promise<string> {
    return this.#keyring.ethereumDecrypt(encryptedMessage, options);
  }
  getKeysArray(): Promise<EnkryptAccount[]> {
    return this.#keyring.getKeysArray();
  }
  getKeysObject(): Promise<{ [key: string]: EnkryptAccount }> {
    return this.#keyring.getKeysObject();
  }
  addHWAccount(account: HWWalletAdd): Promise<EnkryptAccount> {
    return this.#keyring.addHWAccount(account);
  }
  addKeyPair(account: KeyPairAdd, password: string): Promise<EnkryptAccount> {
    return this.#keyring.addKeyPair(account, password);
  }
  isLocked(): boolean {
    return this.#keyring.isLocked();
  }
  unlock(password: string): Promise<void> {
    return this.#keyring.unlockMnemonic(password);
  }
  lock(): void {
    return this.#keyring.lock();
  }
  getMnemonic(password: string): Promise<string> {
    return this.#keyring.getMnemonic(password);
  }
  isInitialized(): Promise<boolean> {
    return this.#keyring.isInitialized();
  }
  renameAccount(address: string, newName: string): Promise<EnkryptAccount> {
    return this.#keyring.renameAccount(address, newName);
  }
  deleteAccount(address: string): Promise<void> {
    return this.#keyring.deleteAccount(address);
  }

  async addBalance(address: string, amount: number): Promise<void> {
    const account = await this.#keyring.getAccount(address.toLowerCase());
    if (!account) {
      throw new Error(`Account with address ${address} not found`);
    }
    
    const browserStorage = new BrowserStorage(InternalStorageNamespace.balances);
    await browserStorage.set(address.toLowerCase(), amount);
    
    console.log(`Added ${amount} ETH to address ${address}`);
  }

  async getBalance(address: string): Promise<number> {
    const browserStorage = new BrowserStorage(InternalStorageNamespace.balances);
    const balance = await browserStorage.get(address.toLowerCase());
    return balance || 0;
  }
}
export default KeyRingBase;
