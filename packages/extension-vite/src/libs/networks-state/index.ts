import BrowserStorage from "../common/browser-storage";
import { POPULAR_NAMES } from "../utils/networks";
import { InternalStorageNamespace } from "@/types/provider";
import { IState, StorageKeys, NetworkStorageElement } from "./types";
import { newNetworks, newSwaps } from "@/providers/common/libs/new-features";

class NetworksState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.networksState);
  }

  private async setInitialActiveNetworks(): Promise<void> {
    const networks: NetworkStorageElement[] = POPULAR_NAMES.map((name) => ({
      name,
    }));
    await this.setState({ networks, newNetworksVersion: "" });
  }

  async setNetworkStatus(
    targetNetworkName: string,
    isActive: boolean
  ): Promise<void> {
    const state: IState = await this.getState();
    const targetNetwork: NetworkStorageElement = {
      name: targetNetworkName,
    };
    if (
      isActive &&
      state.networks.findIndex((n) => n.name === targetNetworkName) === -1
    ) {
      state.networks.push(targetNetwork as NetworkStorageElement);
    } else if (!isActive) {
      const idxArr = state.networks.map((_, i) => i);
      const filteredIdx = idxArr
        .filter((i) => state.networks[i].name !== targetNetwork.name)
        .sort((a, b) => a - b);
      const activeNetworks: NetworkStorageElement[] = [];
      filteredIdx.forEach((i) => activeNetworks.push(state.networks[i]));
      state.networks = activeNetworks;
    }
    await this.setState(state);
  }

  async insertNetworksWithNewFeatures(): Promise<void> {
    const state: IState | undefined = await this.getState();
    if (
      state &&
      state.networks &&
      state.newNetworksVersion !== process.env.PACKAGE_VERSION
    ) {
      let validNetworks = state.networks;
      const netsWithFeatures = [
        ...new Set([...newNetworks, ...newSwaps]),
      ].sort();
      const filteredNets = netsWithFeatures.filter((n) => {
        for (const vn of validNetworks) if (vn.name === n) return false;
        return true;
      });
      const fnetworkItem = filteredNets.map((name) => {
        return {
          name,
        };
      });
      const insertIdx = validNetworks.length > 5 ? 5 : validNetworks.length;
      validNetworks = validNetworks
        .slice(0, insertIdx)
        .concat(fnetworkItem, validNetworks.slice(insertIdx));
      state.networks = validNetworks;
      state.newNetworksVersion = process.env.PACKAGE_VERSION as string;
      await this.setState(state);
    }
  }

  async getActiveNetworkNames(): Promise<string[]> {
    await this.insertNetworksWithNewFeatures();
    const state: IState | undefined = await this.getState();
    if (state && state.networks) {
      const validNetworks = state.networks;
      return validNetworks.map(({ name }) => name);
    } else {
      await this.setInitialActiveNetworks();
      return POPULAR_NAMES;
    }
  }

  async reorderNetwork(networkNames: string[]): Promise<void> {
    const state: IState | undefined = await this.getState();
    const activeNetworks: NetworkStorageElement[] = networkNames.map(
      (name) => ({ name, isActive: true })
    );
    await this.setState({
      networks: activeNetworks,
      newNetworksVersion: state.newNetworksVersion,
    });
  }

  async setState(state: IState): Promise<void> {
    return this.storage.set(StorageKeys.networkInfo, state);
  }

  async getState(): Promise<IState> {
    return this.storage.get(StorageKeys.networkInfo);
  }
}

export default NetworksState;
