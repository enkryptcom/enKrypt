import EthereumProvider from "@/providers/ethereum";
import PolkadotProvider from "@/providers/polkadot";
import { ProviderName } from "@/types/provider";

export default {
  [ProviderName.ethereum]: EthereumProvider,
  [ProviderName.polkadot]: PolkadotProvider,
};
