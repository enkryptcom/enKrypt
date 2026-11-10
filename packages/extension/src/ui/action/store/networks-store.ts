/**
 * @file Manages the state and actions related to networks in the application.
 *
 * This store uses Pinia to manage the state of networks, including fetching all networks,
 * managing pinned networks, and handling test networks. It also holds the popup's
 * current network and sub-network, which are persisted per domain in DomainState.
 */

import { defineStore } from 'pinia';
import { BaseNetwork } from '@/types/base-network';
import NetworksState from '@/libs/networks-state';
import DomainState from '@/libs/domain-state';
import {
  DEFAULT_EVM_NETWORK,
  getAllNetworks,
  getNetworkByName,
} from '@/libs/utils/networks';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import { trackNetwork } from '@/libs/metrics';
import { NetworkChangeEvents } from '@/libs/metrics/types';
import { MessageMethod } from '@/providers/ethereum/types';
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import { MessageMethod as KadenaMessageMethod } from '@/providers/kadena/types';
import { InternalMethods } from '@/types/messenger';
import { EnkryptProviderEventMethods, ProviderName } from '@/types/provider';
import { NetworkNames } from '@enkryptcom/types';
import { computed, ref } from 'vue';
import { useAccountsStore } from './accounts-store';

/**
 * Defines the store for managing networks. The store is initilized in App.vue on mount.
 *
 * @property {NetworksState} networksState - The state management instance for networks.
 * @property {Ref<BaseNetwork[]>} allNetworks - A reference to the list of all networks.
 * @property {Ref<string[]>} pinnedNetworkNames - A reference to the list of pinned network names.
 * @property {Ref<string[]>} enabledTestNetworks - A reference to the list of enabled test networks.
 * @property {Ref<BaseNetwork>} currentNetwork - The network the popup is showing.
 * @property {Ref<string>} currentSubNetwork - Id of the selected sub-network, '' when the current network has none.
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
 * @method {Function} init - Restores the saved network and loads the network list.
 * @method {Function} setCurrentNetwork - Makes a network the current one and loads its accounts.
 * @method {Function} setCurrentSubNetwork - Selects a sub-network of the current network.
 */
export const useNetworksStore = defineStore('useNetworksStore', () => {
  const networksState = new NetworksState();
  const domainState = new DomainState();
  const allNetworks = ref<BaseNetwork[]>([]);
  const pinnedNetworkNames = ref<string[]>([]);
  const enabledTestNetworks = ref<string[]>([]);
  const currentNetwork = ref<BaseNetwork>(DEFAULT_EVM_NETWORK);
  const currentSubNetwork = ref<string>('');
  /** Counts setCurrentNetwork calls, so that a slow call cannot overwrite a later one. */
  let lastNetworkRequest = 0;
  /** Saves of the current network, run one at a time in the order they were made. */
  let saving: Promise<void> = Promise.resolve();

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

  /**
   * The sub-network to use with a network: the saved one when the network has it,
   * otherwise its first one, which is then saved.
   */
  const resolveSubNetwork = async (network: BaseNetwork): Promise<string> => {
    const subNetworks = network.subNetworks ?? [];
    const first = subNetworks[0];
    if (!first) return '';
    const savedId = await domainState.getSelectedSubNetWork();
    if (savedId && subNetworks.some(net => net.id === savedId)) {
      return savedId;
    }
    await domainState.setSelectedSubNetwork(first.id);
    return first.id;
  };

  /**
   * Tells the background and the dapp in the active tab which network is selected.
   * @param network - The selected network
   * @param isChanged - Whether it differs from the network that was saved for this domain
   */
  const notifyTab = async (network: BaseNetwork, isChanged: boolean) => {
    const tabId = await domainState.getCurrentTabId();
    const sendToTab = (method: string, params: unknown[]) =>
      sendToBackgroundFromAction({
        message: JSON.stringify({
          method: InternalMethods.sendToTab,
          params: [{ method, params }],
        }),
        provider: network.provider,
        tabId,
      });
    if (isChanged && (network as EvmNetwork).chainID) {
      await sendToBackgroundFromAction({
        message: JSON.stringify({
          method: InternalMethods.changeNetwork,
          params: [network.name],
        }),
        provider: network.provider,
        tabId,
      });
      await sendToTab(MessageMethod.changeChainId, [
        (network as EvmNetwork).chainID,
      ]);
    }
    if (isChanged && network.provider === ProviderName.kadena) {
      await sendToTab(KadenaMessageMethod.changeNetwork, [network.name]);
    }
    await sendToTab(EnkryptProviderEventMethods.chainChanged, [network.name]);
  };

  /**
   * Saves the current network in DomainState and tells the tab about it.
   * Saves are queued, so each one is compared with the network saved just before
   * it and a change is always announced by the call that saved it.
   */
  const saveAndAnnounce = (network: BaseNetwork) => {
    saving = saving
      .then(async () => {
        const savedNetworkName = await domainState.getSelectedNetWork();
        await domainState.setSelectedNetwork(network.name);
        notifyTab(network, savedNetworkName !== network.name).catch(
          console.error,
        );
      })
      .catch(console.error);
    return saving;
  };

  /**
   * @method setCurrentNetwork - Makes a network the current one and loads its accounts.
   *
   * Resolves once the network, its sub-network and its accounts are in the stores
   * and the network is saved in DomainState. Telling the dapp and loading balances
   * carry on afterwards, so callers are not held up by the tab or by RPC calls.
   * A call that is overtaken by a later one changes nothing.
   *
   * @param network - Network to select
   */
  const setCurrentNetwork = async (network: BaseNetwork) => {
    const accountsStore = useAccountsStore();
    const request = ++lastNetworkRequest;
    trackNetwork(NetworkChangeEvents.NetworkChangePopup, {
      provider: network.provider,
      network: network.name,
    });
    const subNetwork = await resolveSubNetwork(network);
    const accounts = await accountsStore.fetchAccounts(network);
    if (request !== lastNetworkRequest) return;

    // Set together: accounts must never be rendered against another network
    accountsStore.setAccounts(accounts);
    currentNetwork.value = network;
    currentSubNetwork.value = subNetwork;

    accountsStore.checkAddress().catch(console.error);
    accountsStore.fetchBalances();
    await saveAndAnnounce(network);
  };

  /**
   * @method setCurrentSubNetwork - Selects a sub-network of the current network,
   * saves it and reloads the network so balances are read from it.
   * @param id - Id of one of the current network's sub-networks
   */
  const setCurrentSubNetwork = async (id: string) => {
    await domainState.setSelectedSubNetwork(id);
    await setCurrentNetwork(currentNetwork.value);
  };

  /**
   * @method init - Restores the network saved for the current domain, falling back
   * to the default network, and loads the network list.
   */
  const init = async () => {
    // A network change that is still being saved must not be read as the old one
    await saving;
    const savedName = await domainState.getSelectedNetWork();
    const savedNetwork = savedName
      ? await getNetworkByName(savedName)
      : undefined;
    await Promise.all([
      setCurrentNetwork(savedNetwork ?? DEFAULT_EVM_NETWORK),
      setActiveNetworks(),
    ]);
  };

  return {
    networksState,
    allNetworks,
    orderedNetworks,
    pinnedNetworks,
    enabledTestNetworks,
    pinnedNetworkNames,
    currentNetwork,
    currentSubNetwork,
    setIsPinnedNetwork,
    updateNetworkOrder,
    setActiveNetworks,
    setTestNetStatus,
    init,
    setCurrentNetwork,
    setCurrentSubNetwork,
  };
});
