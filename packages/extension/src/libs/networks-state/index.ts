import BrowserStorage from "../common/browser-storage";
import { getAllNetworks, POPULAR_NAMES } from "../utils/networks";
import { InternalStorageNamespace } from "@/types/provider";
import { IState, StorageKeys } from "./types";

class NetworksState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.networksState);
  }

  private async setInitialActiveNetworks(): Promise<void> {
    const networks = getAllNetworks().map(({ name }) => {
      if (POPULAR_NAMES.includes(name)) {
        return { name, isActive: true };
      } else {
        return { name, isActive: false };
      }
    });
    await this.storage.set(StorageKeys.networkInfo, { networks });
  }

  async setNetworkStatus(
    networkName: string,
    isActive: boolean
  ): Promise<void> {
    const state: IState = await this.storage.get(StorageKeys.networkInfo);

    if (state.networks) {
      const networkIndex = state.networks?.findIndex(
        ({ name }) => networkName === name
      );

      if (networkIndex !== undefined && networkIndex !== -1) {
        const network = state.networks?.at(networkIndex);

        if (network) {
          network.isActive = isActive;

          state.networks[networkIndex] = network;
          await this.storage.set(StorageKeys.networkInfo, state);
        }
      }
    }
  }

  async getActiveNetworkNames(): Promise<string[]> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.networkInfo
    );
    if (state && state.networks) {
      return state.networks
        .filter((network) => network.isActive)
        .map(({ name }) => name);
    } else {
      await this.setInitialActiveNetworks();
      return POPULAR_NAMES;
    }
  }

  async getState(): Promise<IState> {
    return this.storage.get(StorageKeys.networkInfo);
  }
}

export default NetworksState;
