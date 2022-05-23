import BrowserStorage from "../common/browser-storage";
import { getAllNetworks } from "../utils/networks";
import { InternalStorageNamespace } from "@/types/provider";
import { IState, StorageKeys } from "./types";

class NetworksState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.networksState);
  }

  async setInitialActiveNetworks(): Promise<void> {
    const popularNames = ["ETH", "MATIC", "DOT", "GLMR"];

    const networks = getAllNetworks().map(({ name }) => {
      if (popularNames.includes(name)) {
        return [name, true];
      } else {
        return [name, false];
      }
    });
    await this.storage.set(StorageKeys.networkInfo, networks);
  }

  async toggleNetwork(networkName: string): Promise<void> {
    const state: IState = await this.storage.get(StorageKeys.networkInfo);
    const networkIndex = state.networks?.findIndex(
      ([name]) => networkName === name
    );

    if (networkIndex !== undefined) {
      const network = state.networks?.at(networkIndex);

      if (network) {
        network[1] = !network[1];

        state.networks![networkIndex] = network;
        await this.storage.set(StorageKeys.networkInfo, state);
      }
    }

    state.networks?.findIndex;
  }

  async getState(): Promise<IState> {
    return this.storage.get(StorageKeys.networkInfo);
  }
}

export default NetworksState;
