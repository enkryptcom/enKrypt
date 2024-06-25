import KeyRing from "@/libs/keyring/keyring";
import EthereumNetworks from "@/providers/ethereum/networks";
import PolkadotNetworks from "@/providers/polkadot/networks";
import BitcoinNetworks from "@/providers/bitcoin/networks";
import KadenaNetworks from "@/providers/kadena/networks";
import { NetworkNames, WalletType } from "@enkryptcom/types";
import { getAccountsByNetworkName } from "@/libs/utils/accounts";
export const initAccounts = async (keyring: KeyRing) => {
  const secp256k1btc = await getAccountsByNetworkName(NetworkNames.Bitcoin);
  const secp256k1 = await getAccountsByNetworkName(NetworkNames.Ethereum);
  const sr25519 = await getAccountsByNetworkName(NetworkNames.Polkadot);
  const ed25519kda = await getAccountsByNetworkName(NetworkNames.Kadena);
  if (secp256k1.length == 0)
    await keyring.saveNewAccount({
      basePath: EthereumNetworks.ethereum.basePath,
      name: "EVM Account 1",
      signerType: EthereumNetworks.ethereum.signer[0],
      walletType: WalletType.mnemonic,
    });
  if (sr25519.length == 0)
    await keyring.saveNewAccount({
      basePath: PolkadotNetworks.polkadot.basePath,
      name: "Substrate Account 1",
      signerType: PolkadotNetworks.polkadot.signer[0],
      walletType: WalletType.mnemonic,
    });
  if (secp256k1btc.length == 0)
    await keyring.saveNewAccount({
      basePath: BitcoinNetworks.bitcoin.basePath,
      name: "Bitcoin Account 1",
      signerType: BitcoinNetworks.bitcoin.signer[0],
      walletType: WalletType.mnemonic,
    });
  if (ed25519kda.length == 0)
    await keyring.saveNewAccount({
      basePath: KadenaNetworks.kadena.basePath,
      name: "Kadena Account 1",
      signerType: KadenaNetworks.kadena.signer[0],
      walletType: WalletType.mnemonic,
    });
};
export const onboardInitializeWallets = async (
  mnemonic: string,
  password: string
): Promise<void> => {
  const kr = new KeyRing();
  await kr.init(mnemonic, password);
};
