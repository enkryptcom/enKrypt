import KeyRing from "@/libs/keyring/keyring";
import EthereumNetworks from "@/providers/ethereum/networks";
import PolkadotNetworks from "@/providers/polkadot/networks";
import BitcoinNetworks from "@/providers/bitcoin/networks";
import { WalletType } from "@enkryptcom/types";
export default async (mnemonic: string, password: string): Promise<void> => {
  const kr = new KeyRing();
  await kr.init(mnemonic, password);
  await kr.unlock(password);
  await kr.saveNewAccount({
    basePath: EthereumNetworks.ethereum.basePath,
    name: "EVM Account 1",
    signerType: EthereumNetworks.ethereum.signer[0],
    walletType: WalletType.mnemonic,
  });
  await kr.saveNewAccount({
    basePath: PolkadotNetworks.polkadot.basePath,
    name: "Substrate Account 1",
    signerType: PolkadotNetworks.polkadot.signer[0],
    walletType: WalletType.mnemonic,
  });
  await kr.saveNewAccount({
    basePath: BitcoinNetworks.bitcoin.basePath,
    name: "Bitcoin Account 1",
    signerType: BitcoinNetworks.bitcoin.signer[0],
    walletType: WalletType.mnemonic,
  });
};
