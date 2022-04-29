import { NodeType, ProviderName } from "@/types/provider";
import EthereumNetworks from "@/providers/ethereum/networks";
import PolkadotNetworks from "@/providers/polkadot/networks";
const providerNetworks: Record<ProviderName, Record<string, NodeType>> = {
  [ProviderName.ethereum]: EthereumNetworks,
  [ProviderName.polkadot]: PolkadotNetworks,
  [ProviderName.enkrypt]: {},
};
const getAllNetworks = (): NodeType[] => {
  return (Object.values(EthereumNetworks) as NodeType[]).concat(
    Object.values(PolkadotNetworks) as NodeType[]
  );
};
const getNetworkByName = (name: string): NodeType | undefined => {
  return getAllNetworks().find((net) => net.name === name);
};
const getProviderNetworkByName = (
  provider: ProviderName,
  networkName: string
): NodeType | undefined => {
  return (Object.values(providerNetworks[provider]) as NodeType[]).find(
    (net) => net.name === networkName
  );
};
const DEFAULT_NETWORK_NAME = "ETH";
export {
  getAllNetworks,
  getNetworkByName,
  getProviderNetworkByName,
  DEFAULT_NETWORK_NAME,
};
