import KeyRing from '@/libs/keyring/keyring';
import EthereumNetworks from '@/providers/ethereum/networks';
import PolkadotNetworks from '@/providers/polkadot/networks';
import BitcoinNetworks from '@/providers/bitcoin/networks';
import KadenaNetworks from '@/providers/kadena/networks';
import SolanaNetworks from '@/providers/solana/networks';
import { NetworkNames, WalletType } from '@enkryptcom/types';
import { getAccountsByNetworkName } from '@/libs/utils/accounts';
import BackupState from '../backup-state';
export const initAccounts = async (keyring: KeyRing) => {
  const secp256k1btc = (
    await getAccountsByNetworkName(NetworkNames.Bitcoin)
  ).filter(acc => !acc.isTestWallet);
  const secp256k1 = (
    await getAccountsByNetworkName(NetworkNames.Ethereum)
  ).filter(acc => !acc.isTestWallet);
  const sr25519 = (
    await getAccountsByNetworkName(NetworkNames.Polkadot)
  ).filter(acc => !acc.isTestWallet);
  const ed25519kda = (
    await getAccountsByNetworkName(NetworkNames.Kadena)
  ).filter(acc => !acc.isTestWallet);
  const ed25519sol = (
    await getAccountsByNetworkName(NetworkNames.Solana)
  ).filter(acc => !acc.isTestWallet);
  if (secp256k1.length == 0)
    await keyring.saveNewAccount({
      basePath: EthereumNetworks.ethereum.basePath,
      name: 'EVM Account 1',
      signerType: EthereumNetworks.ethereum.signer[0],
      walletType: WalletType.mnemonic,
    });
  if (sr25519.length == 0)
    await keyring.saveNewAccount({
      basePath: PolkadotNetworks.polkadot.basePath,
      name: 'Substrate Account 1',
      signerType: PolkadotNetworks.polkadot.signer[0],
      walletType: WalletType.mnemonic,
    });
  if (secp256k1btc.length == 0)
    await keyring.saveNewAccount({
      basePath: BitcoinNetworks.bitcoin.basePath,
      name: 'Bitcoin Account 1',
      signerType: BitcoinNetworks.bitcoin.signer[0],
      walletType: WalletType.mnemonic,
    });
  if (ed25519kda.length == 0)
    await keyring.saveNewAccount({
      basePath: KadenaNetworks.kadena.basePath,
      name: 'Kadena Account 1',
      signerType: KadenaNetworks.kadena.signer[0],
      walletType: WalletType.mnemonic,
    });
  if (ed25519sol.length == 0)
    await keyring.saveNewAccount({
      basePath: SolanaNetworks.solana.basePath,
      name: 'Solana Account 1',
      signerType: SolanaNetworks.solana.signer[0],
      walletType: WalletType.mnemonic,
    });
};
export const onboardInitializeWallets = async (options: {
  mnemonic: string;
  password: string;
  extraWord?: string;
}): Promise<{ backupsFound: boolean }> => {
  const kr = new KeyRing();
  const backupsState = new BackupState();
  const { mnemonic, password, extraWord } = options;
  await kr.init({ mnemonic, password, extraWord });
  try {
    await kr.unlock(password);
    const mainAccount = await kr.getNewAccount({
      basePath: EthereumNetworks.ethereum.basePath,
      signerType: EthereumNetworks.ethereum.signer[0],
    });
    const sigHash = backupsState.getListBackupMsgHash(mainAccount.publicKey);
    const signature = await kr.sign(sigHash as `0x${string}`, {
      basePath: EthereumNetworks.ethereum.basePath,
      signerType: EthereumNetworks.ethereum.signer[0],
      pathIndex: 0,
      walletType: WalletType.mnemonic,
    });
    const backups = await backupsState.listBackups({
      pubkey: mainAccount.publicKey,
      signature,
    });
    kr.lock();
    return { backupsFound: backups.length > 0 };
  } catch (e) {
    console.error(e);
    return { backupsFound: false };
  }
};
