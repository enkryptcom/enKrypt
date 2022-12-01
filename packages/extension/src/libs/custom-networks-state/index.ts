import { CustomEvmNetworkOptions } from "@/providers/ethereum/types/custom-evem-network";
import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import { IState, StorageKeys } from "./types";

export default class CustomNetworksState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(
      InternalStorageNamespace.custoNetworksState
    );
  }

  async addCustomNetwork(options: CustomEvmNetworkOptions) {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo
    );

    if (state && state.customEvmNetworks) {
      state.customEvmNetworks.push(options);
      await this.storage.set(StorageKeys.customNetworksInfo, state);
    } else {
      const newState: IState = {
        customEvmNetworks: [options],
      };
      await this.storage.set(StorageKeys.customNetworksInfo, newState);
    }
  }

  async getCustomNetwork(
    chainId: string
  ): Promise<CustomEvmNetworkOptions | null> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo
    );

    if (state && state.customEvmNetworks) {
      const networkOptions = state.customEvmNetworks.find(
        (option) => option.chainID === chainId
      );

      if (networkOptions) {
        return networkOptions;
      }
    }

    return null;
  }

  async getAllCustomNetworks(): Promise<CustomEvmNetworkOptions[]> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo
    );

    if (state && state.customEvmNetworks) {
      return state.customEvmNetworks;
    }

    return [];
  }
}
