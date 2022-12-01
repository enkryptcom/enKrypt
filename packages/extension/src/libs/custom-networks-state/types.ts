import { CustomEvmNetworkOptions } from "@/providers/ethereum/types/custom-evem-network";

export enum StorageKeys {
  customNetworksInfo = "custom-networks-info",
}

export interface IState {
  customEvmNetworks: CustomEvmNetworkOptions[];
}
