import BrowserStorage from "../common/browser-storage";
import { getAllNetworks, POPULAR_NAMES } from "../utils/networks";
import { InternalStorageNamespace } from "@/types/provider";
import { IState, StorageKeys, NetworkStorageElement } from "./types";

class NetworksState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.networksState);
  }

  private async setInitialActiveNetworks(): Promise<void> {
    const networks: NetworkStorageElement[] = (await getAllNetworks()).map(
      ({ name }) => {
        if (POPULAR_NAMES.includes(name)) {
          return { name, isActive: true };
        } else {
          return { name, isActive: false };
        }
      }
    );

    networks
      .filter((network) => network.isActive)
      .forEach((network, index) => (network.order = index));

    await this.storage.set(StorageKeys.networkInfo, { networks });
  }

  async setNetworkStatus(
    targetNetworkName: string,
    isActive: boolean
  ): Promise<void> {
    const state: IState = await this.storage.get(StorageKeys.networkInfo);

    if (state.networks) {
      let targetNetwork: NetworkStorageElement | undefined =
        state.networks.find((network) => network.name === targetNetworkName);
      if (!targetNetwork) {
        targetNetwork = {
          name: targetNetworkName,
          isActive: true,
        };

        state.networks.push(targetNetwork as NetworkStorageElement);
      }
      if (targetNetwork !== undefined) {
        targetNetwork.isActive = isActive;

        if (isActive) {
          const numActive = state.networks.filter(
            (network) => network.isActive
          ).length;

          targetNetwork.order = numActive - 1;
        } else {
          targetNetwork.order = undefined;
          const activeNetworks = state.networks.filter(
            (network) => network.isActive
          );

          activeNetworks.sort((a, b) => {
            if (a.order! < b.order!) return -1;
            return 1;
          });

          activeNetworks.forEach((network, index) => {
            network.order = index;
          });
        }
      }

      await this.storage.set(StorageKeys.networkInfo, state);
    }
  }

  async getActiveNetworkNames(): Promise<string[]> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.networkInfo
    );
    if (state && state.networks) {
      return state.networks
        .filter((network) => network.isActive)
        .sort((a, b) => {
          if (a.order! < b.order!) return -1;
          return 1;
        })
        .map(({ name }) => name);
    } else {
      await this.setInitialActiveNetworks();
      return POPULAR_NAMES;
    }
  }

  async reorderNetwork(
    targetNetworkName: string,
    beforeNetworkName: string | undefined
  ): Promise<void> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.networkInfo
    );

    if (state && state.networks) {
      const activeNetworks = state.networks
        .filter((network) => network.isActive)
        .sort((a, b) => {
          if (a.order! < b.order!) return -1;
          return 1;
        });

      const targetNetwork = activeNetworks.find(
        (network) => network.name === targetNetworkName
      );

      const beforeNetwork = activeNetworks.find(
        (network) => network.name === beforeNetworkName
      );

      if (targetNetwork !== undefined) {
        if (beforeNetwork === undefined) {
          targetNetwork.order = 0;
        } else {
          targetNetwork.order = beforeNetwork.order! + 1;
        }
      }

      activeNetworks.sort((a, b) => {
        if (a.order! < b.order!) {
          return -1;
        } else if (a.order === b.order && a.name === targetNetworkName) {
          return -1;
        }

        return 1;
      });

      activeNetworks.forEach((network, index) => {
        network.order = index;
      });

      await this.storage.set(StorageKeys.networkInfo, state);
    }
  }

  async getState(): Promise<IState> {
    return this.storage.get(StorageKeys.networkInfo);
  }
}

export default NetworksState;
