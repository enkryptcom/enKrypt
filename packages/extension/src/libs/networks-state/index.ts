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
          return { name };
        }
      }
    ) as NetworkStorageElement[];
    await this.setState({ networks });
  }

  async setNetworkStatus(
    targetNetworkName: string,
    isActive: boolean
  ): Promise<void> {
    const state: IState = await this.getState();
    const targetNetwork: NetworkStorageElement = {
      name: targetNetworkName,
    };
    if (isActive) {
      state.networks.push(targetNetwork as NetworkStorageElement);
    } else {
      const idxArr = state.networks.map((_, i) => i);
      const filteredIdx = idxArr
        .filter((i) => state.networks[i].name !== targetNetwork!.name)
        .sort((a, b) => a - b);
      const activeNetworks: NetworkStorageElement[] = [];
      filteredIdx.forEach((i) => activeNetworks.push(state.networks[i]));
      state.networks = activeNetworks;
    }
    await this.setState(state);
  }

  async getActiveNetworkNames(): Promise<string[]> {
    const state: IState | undefined = await this.getState();
    if (state && state.networks) {
      const validNetworks = state.networks.filter((net) => {
        if ((net as any).isActive === undefined || (net as any).isActive) {
          return true;
        }
      });
      state.networks = validNetworks;
      await this.setState(state);
      return validNetworks.map(({ name }) => name);
    } else {
      await this.setInitialActiveNetworks();
      return POPULAR_NAMES;
    }
  }

  async reorderNetwork(networkNames: string[]): Promise<void> {
    const activeNetworks: NetworkStorageElement[] = networkNames.map(
      (name) => ({ name })
    );
    await this.setState({ networks: activeNetworks });
  }

  async setState(state: IState): Promise<void> {
    return this.storage.set(StorageKeys.networkInfo, state);
  }

  async getState(): Promise<IState> {
    return this.storage.get(StorageKeys.networkInfo);
  }
}

export default NetworksState;
