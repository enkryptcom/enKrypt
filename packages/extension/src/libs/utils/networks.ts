import { NodeType } from "@/types/provider";
import EthereumNetworks from "@/providers/ethereum/networks";
import PolkadotNetworks from "@/providers/polkadot/networks";
const getAllNetworks = (): NodeType[] => {
  return (Object.values(EthereumNetworks) as NodeType[]).concat(
    Object.values(PolkadotNetworks) as NodeType[]
  );
};

export { getAllNetworks };
