import { CustomEvmNetworkOptions } from "@/providers/ethereum/types/custom-evm-network";

export enum StorageKeys {
  customNetworksInfo = "custom-networks-info",
}

export interface IState {
  customEvmNetworks: CustomEvmNetworkOptions[];
}
