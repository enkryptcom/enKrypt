import { NodeType } from "@/types/provider";
import EthereumNetworks from "@/providers/ethereum/networks";
import PolkadotNetworks from "@/providers/polkadot/networks";
const getAllNetworks = (): NodeType[] => {
  return (Object.values(EthereumNetworks) as NodeType[]).concat(
    Object.values(PolkadotNetworks) as NodeType[]
  );
};
const getNetworkByName = (name: string): NodeType | undefined => {
  return getAllNetworks().find((net) => net.name === name);
};
const DEFAULT_NETWORK_NAME = "ETH";
export { getAllNetworks, getNetworkByName, DEFAULT_NETWORK_NAME };
