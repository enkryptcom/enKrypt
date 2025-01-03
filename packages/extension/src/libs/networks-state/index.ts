import BrowserStorage from '../common/browser-storage';
import { POPULAR_NAMES } from '../utils/networks';
import { InternalStorageNamespace } from '@/types/provider';
import { IState, StorageKeys, NetworkStorageElement } from './types';
import { newNetworks, newSwaps } from '@/providers/common/libs/new-features';

class NetworksState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.networksState);
  }

  private async setInitialActiveNetworks(): Promise<void> {
    const networks: NetworkStorageElement[] = POPULAR_NAMES.map(name => ({
      name,
    }));
    await this.setState({
      networks,
      newNetworksVersion: '',
      enabledTestNetworks: [],
      newUsedFeatures: { networks: [], swap: [] },
    });
  }

  async setNetworkStatus(
    targetNetworkName: string,
    // isActive represents whether or not the network is pinned on the ui
    isActive: boolean,
  ): Promise<void> {
    const state: IState = await this.getState();
    const targetNetwork: NetworkStorageElement = {
      name: targetNetworkName,
    };
    if (
      isActive &&
      state.networks.findIndex(n => n.name === targetNetworkName) === -1
    ) {
      state.networks.push(targetNetwork as NetworkStorageElement);
    } else if (!isActive) {
      const idxArr = state.networks.map((_, i) => i);
      const filteredIdx = idxArr
        .filter(i => state.networks[i].name !== targetNetwork.name)
        .sort((a, b) => a - b);
      const activeNetworks: NetworkStorageElement[] = [];
      filteredIdx.forEach(i => activeNetworks.push(state.networks[i]));
      state.networks = activeNetworks;
    }
    await this.setState(state);
  }

  /**
   * Inserts networks with new features.
   *
   * This method first retrieves the current state and checks if the networks
   * have been updated to the latest version. If the state and networks are defined,
   * it filters out the networks that are not in the predefined list of networks with new features.
   * It then maps the filtered networks to a new network item and inserts them into the valid networks.
   * The new networks are inserted at the 6th index, or at the end if there are fewer than 6 networks.
   * The state is then updated with the new networks and the latest version.
   */
  async insertNetworksWithNewFeatures(): Promise<void> {
    const state: IState | undefined = await this.getState();
    if (
      state &&
      state.networks &&
      state.newNetworksVersion !== __PACKAGE_VERSION__
    ) {
      let validNetworks = state.networks;
      const netsWithFeatures = [
        ...new Set([...newNetworks, ...newSwaps]),
      ].sort();
      const filteredNets = netsWithFeatures.filter(n => {
        for (const vn of validNetworks) if (vn.name === n) return false;
        return true;
      });
      const fnetworkItem = filteredNets.map(name => {
        return {
          name,
        };
      });
      const insertIdx = validNetworks.length > 5 ? 5 : validNetworks.length;
      validNetworks = validNetworks
        .slice(0, insertIdx)
        .concat(fnetworkItem, validNetworks.slice(insertIdx));
      state.networks = validNetworks;
      state.newNetworksVersion = __PACKAGE_VERSION__ as string;
      state.newUsedFeatures = { networks: [], swap: [] };
      await this.setState(state);
    }
  }

  async setUsedFeature(feature: 'networks' | 'swap', networkName: string) {
    const state: IState | undefined = await this.getState();
    if (state) {
      const newUsedFeatures = state.newUsedFeatures || {
        networks: [],
        swap: [],
      };
      newUsedFeatures[feature].push(networkName);
      await this.setState({ ...state, newUsedFeatures });
    }
  }

  async getUsedFeatures(): Promise<IState['newUsedFeatures']> {
    const state: IState | undefined = await this.getState();
    if (state && state.newUsedFeatures) {
      return state.newUsedFeatures;
    }
    return { networks: [], swap: [] };
  }

  /**
   * Retrieves the names of the pinned networks.
   *
   * This method first ensures that networks with new features are inserted.
   * It then attempts to retrieve the current state. If the state and its networks
   * are defined, it maps and returns the names of the valid networks.
   * If the state or networks are not defined, it sets the initial active networks
   * and returns a predefined list of popular network names.
   *
   * Previously, the method was named `getActiveNetworks`.
   * @returns {Promise<string[]>} A promise that resolves to an array of active network names.
   */
  async getPinnedNetworkNames(): Promise<string[]> {
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

  async getEnabledTestNetworks(): Promise<string[]> {
    await this.insertNetworksWithNewFeatures();
    const state: IState | undefined = await this.getState();
    if (state && state.enabledTestNetworks) {
      const validNetworks = state.enabledTestNetworks;
      return validNetworks.map(({ name }) => name);
    } else {
      this.setState(Object.assign({}, state, { enabledTestNetworks: [] }));
      return [];
    }
  }

  async setTestnetStatus(
    networkName: string,
    isEnabled: boolean,
  ): Promise<void> {
    const state: IState | undefined = await this.getState();
    const enabledTestNetworks = (state.enabledTestNetworks || []).filter(
      n => n.name !== networkName,
    );
    if (isEnabled) enabledTestNetworks.push({ name: networkName });
    await this.setState({ ...state, enabledTestNetworks });
  }

  async reorderNetwork(networkNames: string[]): Promise<void> {
    const state: IState | undefined = await this.getState();
    const activeNetworks: NetworkStorageElement[] = networkNames.map(name => ({
      name,
      isActive: true,
    }));
    await this.setState({ ...state, networks: activeNetworks });
  }

  async setState(state: IState): Promise<void> {
    return this.storage.set(StorageKeys.networkInfo, state);
  }

  async getState(): Promise<IState> {
    return this.storage.get(StorageKeys.networkInfo);
  }
}

export default NetworksState;
