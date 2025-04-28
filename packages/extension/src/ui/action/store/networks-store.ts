/**
 * @file Manages the state and actions related to networks in the application.
 *
 * This store uses Pinia to manage the state of networks, including fetching all networks,
 * managing pinned networks, and handling test networks.
 */

import { defineStore } from 'pinia';
import { BaseNetwork } from '@/types/base-network';
import NetworksState from '@/libs/networks-state';
import { getAllNetworks } from '@/libs/utils/networks';
import { NetworkNames } from '@enkryptcom/types';
import { computed, ref } from 'vue';

/**
 * Defines the store for managing networks. The store is initilized in App.vue on mount.
 *
 * @property {NetworksState} networksState - The state management instance for networks.
 * @property {Ref<BaseNetwork[]>} allNetworks - A reference to the list of all networks.
 * @property {Ref<string[]>} pinnedNetworkNames - A reference to the list of pinned network names.
 * @property {Ref<string[]>} enabledTestNetworks - A reference to the list of enabled test networks.
 *
 * @computed
 * @computed {ComputedRef<BaseNetwork[]>} pinnedNetworks - A computed reference to the list of pinned networks.
 * @computed {ComputedRef<BaseNetwork[]>} orderedNetworks - A computed reference to the ordered list of networks, with pinned networks first and test networks included only if enabled.
 *
 * @actions
 * @method {Function} setIsPinnedNetwork - Sets the pinned network status.
 * @method {Function} updateNetworkOrder - Updates the order of the pinned networks and refreshes the active networks.
 * @method {Function} setActiveNetworks - Fetches and sets the active networks, pinned network names, and enabled test networks.
 * @method {Function} setTestNetStatus - Sets the test network status.
 */
export const useNetworksStore = defineStore('useNetworksStore', () => {
  const networksState = new NetworksState();
  const allNetworks = ref<BaseNetwork[]>([]);
  const pinnedNetworkNames = ref<string[]>([]);
  const enabledTestNetworks = ref<string[]>([]);

  /**
   * @property {ComputedRef<BaseNetwork[]>} pinnedNetworks - A computed reference to the list of pinned networks.
   */
  const pinnedNetworks = computed<BaseNetwork[]>(() => {
    return pinnedNetworkNames.value
      .map(name => {
        const network = allNetworks.value.find(
          network => network.name === name,
        );
        if (network) {
          return network;
        }
        return null;
      })
      .filter(network => network !== null) as BaseNetwork[];
  });

  /**
   * @property {ComputedRef<BaseNetwork[]>} orderedNetworks - A computed reference to the ordered list of networks, with pinned networks first and test networks included only if enabled.
   *
   * The list is composed of pinned networks followed by all other networks
   * that are not pinned. Test networks are included only if they are enabled.
   *
   * @returns {BaseNetwork[]} An array of networks in the desired order.
   */
  const orderedNetworks = computed<BaseNetwork[]>(() => {
    return [
      ...pinnedNetworks.value,
      ...allNetworks.value.filter(network => {
        if (pinnedNetworkNames.value.includes(network.name)) {
          return false;
        }
        if (network.isTestNetwork) {
          return enabledTestNetworks.value.includes(network.name);
        }
        return true;
      }),
    ];
  });

  /**
   * @method setActiveNetworks - Fetches and sets the active networks, pinned network names, and enabled test networks.
   */
  const setActiveNetworks = async () => {
    allNetworks.value = await getAllNetworks();
    pinnedNetworkNames.value = await networksState.getPinnedNetworkNames();
    enabledTestNetworks.value = await networksState.getEnabledTestNetworks();
  };

  /**
   * @method updateNetworkOrder - Updates the order of the pinned networks and refreshes the active networks.
   * @param newOrder - The new order of the PINNED networks
   */
  const updateNetworkOrder = async (newOrder: NetworkNames[]) => {
    await networksState.reorderNetwork(newOrder);
    await setActiveNetworks();
  };

  /**
   * @method setIsPinnedNetwork - sets the pinned network status
   * @param network - Network name to be pinned or unpinned
   * @param isPinned - Boolean value to determine if network is pinned or unpinned
   */
  const setIsPinnedNetwork = async (network: string, isPinned: boolean) => {
    try {
      await networksState.setNetworkStatus(network, isPinned);
      await setActiveNetworks();
    } catch (error) {
      console.error('Failed to set pined network:', error);
    }
  };

  /**
   *
   * @param network {string} - network to be updated
   * @param status - boolean value to determine if network is enabled or disabled
   */
  const setTestNetStatus = async (network: string, status: boolean) => {
    try {
      await networksState.setTestnetStatus(network, status);
    } catch (error) {
      console.error('Failed to set test network status:', error);
    }
  };

  return {
    networksState,
    allNetworks,
    orderedNetworks,
    pinnedNetworks,
    enabledTestNetworks,
    pinnedNetworkNames,
    setIsPinnedNetwork,
    updateNetworkOrder,
    setActiveNetworks,
    setTestNetStatus,
  };
});
