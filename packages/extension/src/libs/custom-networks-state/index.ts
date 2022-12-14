import { CustomEvmNetworkOptions } from "@/providers/ethereum/types/custom-evm-network";
import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import { IState, StorageKeys } from "./types";

export default class CustomNetworksState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(
      InternalStorageNamespace.customNetworksState
    );
  }

  async addCustomNetwork(options: CustomEvmNetworkOptions): Promise<string> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo
    );
    options.name = `custom-${options.name}`;
    if (state && state.customEvmNetworks) {
      const networkExists = state.customEvmNetworks.find(
        (net) => net.chainID === options.chainID
      );

      if (networkExists) {
        return networkExists.name;
      }
      state.customEvmNetworks.push(options);
      await this.storage.set(StorageKeys.customNetworksInfo, state);
    } else {
      const newState: IState = {
        customEvmNetworks: [options],
      };
      await this.storage.set(StorageKeys.customNetworksInfo, newState);
    }
    return options.name;
  }

  async getCustomEVMNetwork(
    chainId: `0x${string}`
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

  async getAllCustomEVMNetworks(): Promise<CustomEvmNetworkOptions[]> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo
    );

    if (state && state.customEvmNetworks) {
      return state.customEvmNetworks;
    }

    return [];
  }

  async deleteEVMNetwork(chainID: string): Promise<void> {
    const state: IState = await this.storage.get(
      StorageKeys.customNetworksInfo
    );

    if (state && state.customEvmNetworks) {
      state.customEvmNetworks = state.customEvmNetworks.filter(
        (net) => net.chainID !== chainID
      );

      await this.storage.set(StorageKeys.customNetworksInfo, state);
    }
  }
}
