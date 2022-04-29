import KeyRing from "@/libs/keyring/keyring";
import EthereumNetworks from "@/providers/ethereum/networks";
import PolkadotNetworks from "@/providers/polkadot/networks";
export default async (mnemonic: string, password: string): Promise<void> => {
  const kr = new KeyRing();
  await kr.init(mnemonic, password);
  await kr.unlock(password);
  await kr.saveNewAccount({
    basePath: EthereumNetworks.ethereum.basePath,
    name: "Account 1",
    type: EthereumNetworks.ethereum.signer[0],
  });
  await kr.saveNewAccount({
    basePath: PolkadotNetworks.polkadot.basePath,
    name: "Account 2",
    type: PolkadotNetworks.polkadot.signer[0],
  });
};
