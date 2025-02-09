<template>
  <div class="app" :class="{ locked: isLocked }">
    <div v-if="isLoading" class="app__loading">
      <swap-looking-animation />
    </div>
    <div v-show="!isLoading" ref="appMenuRef" class="app__menu">
      <!-- LOGO & TOP MENU -->
      <div class="app__menu-row" :class="{ border: networks.length > 9 }">
        <div class="app__menu-row">
          <logo-min class="app__menu-logo" />
          <updated-icon
            v-if="loadedUpdates && showUpdatesBtn"
            @click="openUpdatesDialog(UpdatesOpenLocation.logo)"
            class="app__menu-updated"
          />
        </div>
        <div>
          <a ref="toggle" class="app__menu-link" @click="toggleMoreMenu">
            <more-icon />
          </a>
          <div v-show="isOpenMore" ref="dropdown" class="app__menu-dropdown">
            <a class="app__menu-dropdown-link" @click="otherNetworksAction">
              <manage-networks-icon /> <span>Other networks</span>
            </a>
            <a class="app__menu-dropdown-link" @click="lockAction">
              <hold-icon /> <span>Lock Enkrypt</span>
            </a>
            <a class="app__menu-dropdown-link" @click="settingsAction">
              <settings-icon /> <span>Settings</span>
            </a>
            <div v-if="loadedUpdates" class="app__menu-dropdown-divider"></div>
            <a
              v-if="loadedUpdates"
              class="app__menu-dropdown-link"
              @click="openUpdatesDialog(UpdatesOpenLocation.settings)"
            >
              <heart-icon class="app__menu-dropdown-link-heart"></heart-icon>
              <span> Updates</span>
            </a>
          </div>
        </div>
      </div>
      <base-search
        :value="searchInput"
        :is-border="false"
        @update:value="updateSearchValue"
      />
      <app-menu-tab
        :active-category="activeCategory"
        @update:category="setActiveCategory"
      />
      <app-menu
        :networks="displayNetworks"
        :pinnedNetworks="pinnedNetworks"
        :selected="route.params.id as string"
        :active-category="activeCategory"
        :search-input="searchInput"
        @update:order="updateNetworkOrder"
        @update:network="setNetwork"
        @update:gradient="updateGradient"
        @update:pin-network="setIsPinnedNetwork"
      />
    </div>

    <div v-show="!isLoading" class="app__content">
      <accounts-header
        v-show="showNetworkMenu"
        :account-info="accountHeaderData"
        :network="currentNetwork"
        :show-deposit="showDepositWindow"
        @update:init="init"
        @address-changed="onSelectedAddressChanged"
        @select:subnetwork="onSelectedSubnetworkChange"
        @toggle:deposit="toggleDepositWindow"
      />
      <router-view v-slot="{ Component }" name="view">
        <transition :name="transitionName" mode="out-in">
          <component
            :is="Component"
            :key="route.fullPath"
            :network="currentNetwork"
            :subnetwork="currentSubNetwork"
            :account-info="accountHeaderData"
            @update:init="init"
            @toggle:deposit="toggleDepositWindow"
            @open:buy-action="openBuyPage"
          />
        </transition>
      </router-view>

      <network-menu
        v-show="showNetworkMenu"
        :selected="route.params.id as string"
        :network="currentNetwork"
      />
    </div>

    <add-network
      v-if="addNetworkShow"
      @close:popup="addNetworkShow = !addNetworkShow"
      @update:pin-network="setIsPinnedNetwork"
      @update:testNetworkToggle="setIsToggledTestNetwork"
    />
    <settings
      v-if="settingsShow"
      @close:popup="settingsShow = !settingsShow"
      @action:lock="lockAction"
    />
    <modal-rate v-if="rateShow" @close:popup="rateShow = !rateShow" />
    <modal-new-version
      v-if="updateShow"
      :current-version="currentVersion"
      :latest-version="latestVersion"
      @close:popup="updateShow = !updateShow"
    />
    <modal-updates
      v-if="loadedUpdates && showUpdatesDialog"
      :versions="releases?.versions"
      :current-version="currentVersion"
      :current-network="currentNetwork.name"
      @close:popup="closeUpdatesDialog"
    />
  </div>
</template>

<script setup lang="ts">
import DomainState from '@/libs/domain-state';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import NetworksState from '@/libs/networks-state';
import {
  getAccountsByNetworkName,
  getOtherSigners,
} from '@/libs/utils/accounts';
import ModalNewVersion from './views/modal-new-version/index.vue';
import {
  DEFAULT_EVM_NETWORK,
  getAllNetworks,
  getNetworkByName,
} from '@/libs/utils/networks';
import openOnboard from '@/libs/utils/open-onboard';
import BTCAccountState from '@/providers/bitcoin/libs/accounts-state';
import EVMAccountState from '@/providers/ethereum/libs/accounts-state';
import SolAccountState from '@/providers/solana/libs/accounts-state';
import { MessageMethod } from '@/providers/ethereum/types';
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import { MessageMethod as KadenaMessageMethod } from '@/providers/kadena/types';
import { BaseNetwork } from '@/types/base-network';
import { InternalMethods } from '@/types/messenger';
import { EnkryptAccount, NetworkNames } from '@enkryptcom/types';
import { fromBase } from '@enkryptcom/utils';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Browser from 'webextension-polyfill';
import AccountsHeader from './components/accounts-header/index.vue';
import AppMenu from './components/app-menu/index.vue';
import AppMenuTab from './components/app-menu/components/app-menu-tab.vue';
import BaseSearch from './components/base-search/index.vue';
import NetworkMenu from './components/network-menu/index.vue';
import MoreIcon from './icons/actions/more.vue';
import HoldIcon from './icons/common/hold-icon.vue';
import LogoMin from './icons/common/logo-min.vue';
import ManageNetworksIcon from './icons/common/manage-networks-icon.vue';
import SettingsIcon from './icons/common/settings-icon.vue';
import { AccountsHeaderData } from './types/account';
import AddNetwork from './views/add-network/index.vue';
import ModalRate from './views/modal-rate/index.vue';
import Settings from './views/settings/index.vue';
import ModalUpdates from './views/updates/index.vue';
import { KadenaNetwork } from '@/providers/kadena/types/kadena-network';
import { EnkryptProviderEventMethods, ProviderName } from '@/types/provider';
import { onClickOutside } from '@vueuse/core';
import RateState from '@/libs/rate-state';
import SwapLookingAnimation from '@action/icons/swap/swap-looking-animation.vue';
import {
  trackBuyEvents,
  trackNetwork,
  trackUpdatesEvents,
} from '@/libs/metrics';
import { getLatestEnkryptVersion } from '@action/utils/browser';
import { gt as semverGT } from 'semver';
import {
  BuyEventType,
  NetworkChangeEvents,
  UpdatesEventType,
  UpdatesOpenLocation,
} from '@/libs/metrics/types';
import { NetworksCategory } from '@action/types/network-category';
import { newNetworks } from '@/providers/common/libs/new-features';
import UpdatesState from '@/libs/updates-state';
import UpdatedIcon from '@/ui/action/icons/updates/updated.vue';
import HeartIcon from '@/ui/action/icons/updates/heart.vue';
import { getLatestEnkryptUpdates } from '@action/utils/browser';
import { Updates } from '@/ui/action/types/updates';
import BackupState from '@/libs/backup-state';

const domainState = new DomainState();
const networksState = new NetworksState();
const rateState = new RateState();
const updatesState = new UpdatesState();
const backupState = new BackupState();
const appMenuRef = ref(null);
const showDepositWindow = ref(false);
const accountHeaderData = ref<AccountsHeaderData>({
  activeAccounts: [],
  inactiveAccounts: [],
  selectedAccount: null,
  activeBalances: [],
});

const isOpenMore = ref(false);
let timeout: ReturnType<typeof setTimeout> | null = null;
defineExpose({ appMenuRef });
const router = useRouter();
const route = useRoute();
const transitionName = 'fade';
const searchInput = ref('');
const activeCategory = ref<NetworksCategory>(NetworksCategory.All);
const networks = ref<BaseNetwork[]>([]);
const pinnedNetworks = ref<BaseNetwork[]>([]);
const defaultNetwork = DEFAULT_EVM_NETWORK;
const currentNetwork = ref<BaseNetwork>(defaultNetwork);
const currentSubNetwork = ref<string>('');
const kr = new PublicKeyRing();
const addNetworkShow = ref(false);
const settingsShow = ref(false);
const rateShow = ref(false);
const updateShow = ref(false);
const dropdown = ref(null);
const toggle = ref(null);
const isLoading = ref(true);
const currentVersion = __PACKAGE_VERSION__;
const latestVersion = ref('');
const enabledTestnetworks = ref<string[]>([]);
/** -------------------
 * Updates
 -------------------*/
const releases = ref<Updates | null>(null);
const loadedUpdates = ref<boolean>(false);
const showUpdatesBtn = ref<boolean>(false);
const showUpdatesDialog = ref<boolean>(false);
const stateCurrentReleaseTimestamp = ref<number>(0);

/**
 * Initializes the update state by performing the following actions:
 * 1. Retrieves the current release from the state.
 * 2. Updates the current release timestamp.
 * 3. If the current release is empty or different from the current version in the app state,
 *    sets the current release and updates the release timestamp.
 * 4. Fetches the latest Enkrypt updates and sets the releases state.
 * 5. Displays the updates button if there are new releases.
 * 6. Sets the loadedUpdates state to true if successful, otherwise false.
 *
 * @async
 * @function initUpdateState
 * @returns {Promise<void>} A promise that resolves when the update state is initialized.
 * @throws Will log an error message if the initialization fails.
 */
const initUpdateState = async () => {
  try {
    const currentReleaseInState = await updatesState.getCurrentRelease();
    stateCurrentReleaseTimestamp.value =
      await updatesState.getCurrentReleaseTimestamp();
    if (
      currentReleaseInState === '' ||
      currentReleaseInState !== currentVersion
    ) {
      await updatesState.setCurrentRelease(currentVersion);
      const newReleaseTimestamp = Date.now();
      await updatesState.setCurrentReleaseTimestamp(newReleaseTimestamp);
      stateCurrentReleaseTimestamp.value = newReleaseTimestamp;
    }
    releases.value = await getLatestEnkryptUpdates();
    if (releases.value) {
      await getShowUpdatesBtn();
    }
    loadedUpdates.value = true;
  } catch (error) {
    console.error('Failed to init update state:', error);
    loadedUpdates.value = false;
  }
};

/**
 * Asynchronously determines whether to show the updates button based on the last version viewed and the current version.
 *
 * The function performs the following steps:
 * 1. Retrieves the last version viewed from the updates state.
 * 2. Checks if the last version viewed is empty or if the current version is greater than the last version viewed.
 * 3. If the above condition is true, calculates an expiration timestamp (2 weeks from the current release timestamp).
 * 4. Sets the `showUpdatesBtn` value to true if the current release timestamp is less than the expiration timestamp.
 * 5. Otherwise, sets the `showUpdatesBtn` value to false.
 *
 * If an error occurs during the process, it logs an error message to the console.
 *
 * @returns {Promise<void>} A promise that resolves when the function completes.
 */
const getShowUpdatesBtn = async () => {
  try {
    const lastVersionViewed = await updatesState.getLastVersionViewed();
    if (
      lastVersionViewed === '' ||
      (currentVersion && semverGT(currentVersion, lastVersionViewed))
    ) {
      const expireTimestamp = stateCurrentReleaseTimestamp.value + 12096e5; //2 weeks;
      showUpdatesBtn.value =
        stateCurrentReleaseTimestamp.value < expireTimestamp;
    } else {
      showUpdatesBtn.value = false;
    }
  } catch (error) {
    console.error('Failed to get show updates button:', error);
  }
};

const openUpdatesDialog = (_location: UpdatesOpenLocation) => {
  showUpdatesDialog.value = true;
  updatesState.setLastVersionViewed(currentVersion);
  showUpdatesBtn.value = false;
  if (isOpenMore.value) {
    closeMoreMenu();
  }
  trackUpdatesEvents(UpdatesEventType.UpdatesOpen, {
    network: currentNetwork.value.name,
    location: _location,
  });
};

const closeUpdatesDialog = () => {
  showUpdatesDialog.value = false;
};

/** -------------------
 * Core
 -------------------*/
const setActiveNetworks = async () => {
  const pinnedNetworkNames = await networksState.getPinnedNetworkNames();
  const allNetworks = await getAllNetworks();
  enabledTestnetworks.value = await networksState.getEnabledTestNetworks();
  pinnedNetworks.value = [];
  pinnedNetworkNames.forEach(name => {
    const network = allNetworks.find(network => network.name === name);
    if (network !== undefined) pinnedNetworks.value.push(network);
  });
  networks.value = [
    ...pinnedNetworks.value,
    ...allNetworks.filter(
      network => !pinnedNetworkNames.includes(network.name),
    ),
  ];
};

const updateNetworkOrder = (newOrder: BaseNetwork[]) => {
  if (searchInput.value === '') {
    if (activeCategory.value === NetworksCategory.Pinned)
      pinnedNetworks.value = newOrder;
    else networks.value = newOrder;
  }
};
const updateSearchValue = (newval: string) => {
  searchInput.value = newval;
};
const toggleDepositWindow = () => {
  showDepositWindow.value = !showDepositWindow.value;
};
const openBuyPage = () => {
  const buyLink = (() => {
    switch (currentNetwork.value.name) {
      case NetworkNames.KadenaTestnet:
        return (currentNetwork.value as KadenaNetwork).options.buyLink;
      case NetworkNames.SyscoinNEVM:
      case NetworkNames.Rollux:
        return `${(currentNetwork.value as EvmNetwork).options.buyLink}&address=${currentNetwork.value.displayAddress(
          accountHeaderData.value.selectedAccount!.address,
        )}`;
      case NetworkNames.SyscoinNEVMTest:
      case NetworkNames.RolluxTest:
        return (currentNetwork.value as EvmNetwork).options.buyLink;
      default:
        return `https://ccswap.myetherwallet.com/?to=${currentNetwork.value.displayAddress(
          accountHeaderData.value.selectedAccount!.address,
        )}&network=${currentNetwork.value.name}&crypto=${
          currentNetwork.value.currencyName
        }&platform=enkrypt`;
    }
  })();
  Browser.tabs.create({
    url: buyLink,
  });
  trackBuyEvents(BuyEventType.BuyClick, { network: currentNetwork.value.name });
};
const isKeyRingLocked = async (): Promise<boolean> => {
  return await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.isLocked,
      params: [],
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  }).then(res => JSON.parse(res.result || 'true'));
};

const init = async () => {
  const curNetwork = await domainState.getSelectedNetWork();
  if (curNetwork) {
    const savedNetwork = await getNetworkByName(curNetwork);
    if (savedNetwork) setNetwork(savedNetwork);
    else setNetwork(defaultNetwork);
  } else {
    setNetwork(defaultNetwork);
  }
  await setActiveNetworks();
  isLoading.value = false;
};

onMounted(async () => {
  const isInitialized = await kr.isInitialized();
  if (isInitialized) {
    const _isLocked = await isKeyRingLocked();
    if (_isLocked) {
      router
        .push({ name: 'lock-screen' })
        .then(() => (isLoading.value = false));
    } else {
      init();
      backupState.backup(true).catch(console.error);
      setTimeout(() => {
        rateState.showPopup().then(show => {
          if (show) {
            rateShow.value = true;
          } else {
            getLatestEnkryptVersion().then(version => {
              if (
                currentVersion &&
                version &&
                semverGT(version, currentVersion)
              ) {
                latestVersion.value = version;
                updateShow.value = true;
              }
            });
          }
        });
      }, 2000);
    }
    initUpdateState();
  } else {
    openOnboard();
  }
});
/**
 * Update the gradient of the app menu on the active network change
 */
const updateGradient = (newGradient: string) => {
  //hack may be there is a better way. less.modifyVars doesnt work
  if (appMenuRef.value)
    (appMenuRef.value as HTMLElement).style.background =
      `radial-gradient(137.35% 97% at 100% 50%, rgba(250, 250, 250, 0.94) 0%, rgba(250, 250, 250, 0.96) 28.91%, rgba(250, 250, 250, 0.98) 100%), linear-gradient(180deg, ${newGradient} 80%, #684CFF 100%)`;
};
const setNetwork = async (network: BaseNetwork) => {
  trackNetwork(NetworkChangeEvents.NetworkChangePopup, {
    provider: network.provider,
    network: network.name,
  });
  if (!network.subNetworks) {
    currentSubNetwork.value = '';
  }
  const activeAccounts = await getAccountsByNetworkName(network.name);

  const inactiveAccounts = await kr.getAccounts(
    getOtherSigners(network.signer),
  );
  const selectedAddress = await domainState.getSelectedAddress();
  let selectedAccount = activeAccounts[0];
  if (selectedAddress) {
    const found = activeAccounts.find(acc => acc.address === selectedAddress);
    if (found) selectedAccount = found;
  }

  accountHeaderData.value = {
    activeAccounts,
    inactiveAccounts,
    selectedAccount,
    activeBalances: activeAccounts.map(() => '~'),
  };
  currentNetwork.value = network;
  router.push({ name: 'assets', params: { id: network.name } });
  const tabId = await domainState.getCurrentTabId();
  const curSavedNetwork = await domainState.getSelectedNetWork();

  if (
    curSavedNetwork !== network.name &&
    (currentNetwork.value as EvmNetwork).chainID
  ) {
    await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: InternalMethods.changeNetwork,
        params: [currentNetwork.value.name],
      }),
      provider: currentNetwork.value.provider,
      tabId,
    });
    await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: InternalMethods.sendToTab,
        params: [
          {
            method: MessageMethod.changeChainId,
            params: [(currentNetwork.value as EvmNetwork).chainID],
          },
        ],
      }),
      provider: currentNetwork.value.provider,
      tabId,
    });
  }

  if (
    curSavedNetwork !== network.name &&
    currentNetwork.value.provider === ProviderName.kadena
  ) {
    await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: InternalMethods.sendToTab,
        params: [
          {
            method: KadenaMessageMethod.changeNetwork,
            params: [currentNetwork.value.name],
          },
        ],
      }),
      provider: currentNetwork.value.provider,
      tabId,
    });
  }

  await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.sendToTab,
      params: [
        {
          method: EnkryptProviderEventMethods.chainChanged,
          params: [network.name],
        },
      ],
    }),
    provider: currentNetwork.value.provider,
    tabId,
  });
  domainState.setSelectedNetwork(network.name);

  if (network.api) {
    try {
      const thisNetworkName = currentNetwork.value.name;
      const api = await network.api();
      const activeBalancePromises = activeAccounts.map(acc =>
        api.getBalance(acc.address),
      );
      Promise.all(activeBalancePromises).then(balances => {
        if (thisNetworkName === currentNetwork.value.name)
          accountHeaderData.value.activeBalances = balances.map(bal =>
            fromBase(bal, network.decimals),
          );
      });
    } catch (e) {
      console.error(e);
    }
  }
};

const onSelectedSubnetworkChange = async (id: string) => {
  await domainState.setSelectedSubNetwork(id);
  currentSubNetwork.value = id;
  setNetwork(currentNetwork.value);
};

const onSelectedAddressChanged = async (newAccount: EnkryptAccount) => {
  accountHeaderData.value.selectedAccount = newAccount;
  const accountStates = {
    [ProviderName.ethereum]: EVMAccountState,
    [ProviderName.bitcoin]: BTCAccountState,
    [ProviderName.solana]: SolAccountState,
  };
  if (Object.keys(accountStates).includes(currentNetwork.value.provider)) {
    const AccountState = new accountStates[
      currentNetwork.value.provider as keyof typeof accountStates
    ]();
    const domain = await domainState.getCurrentDomain();
    AccountState.addApprovedAddress(newAccount.address, domain);
  }
  await domainState.setSelectedAddress(newAccount.address);
  await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.sendToTab,
      params: [
        {
          method: MessageMethod.changeAddress,
          params: [currentNetwork.value.displayAddress(newAccount.address)],
        },
      ],
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  });
};
const showNetworkMenu = computed(() => {
  const selected = route.params.id as string;
  return (
    !!selected &&
    (route.name == 'activity' ||
      route.name == 'assets' ||
      route.name == 'nfts' ||
      route.name == 'dapps')
  );
});
const isLocked = computed(() => {
  return route.name == 'lock-screen';
});

/**-------------------
 * Network Categories
 -------------------*/
const setActiveCategory = async (category: NetworksCategory) => {
  await setActiveNetworks();
  activeCategory.value = category;
};

/**
 * Display Networks
 * Categories: All, Pinned, New
 */
const displayNetworks = computed<BaseNetwork[]>(() => {
  switch (activeCategory.value) {
    case NetworksCategory.All:
      return networks.value.filter(net =>
        net.isTestNetwork ? enabledTestnetworks.value.includes(net.name) : true,
      );
    case NetworksCategory.Pinned:
      return pinnedNetworks.value;
    case NetworksCategory.New:
      return networks.value.filter(net => newNetworks.includes(net.name));
    default:
      return networks.value;
  }
});

/** -------------------
 * Menu Actions
 * ------------------- */

const lockAction = async () => {
  sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.lock,
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  });
  router.push({ name: 'lock-screen' });
};
const settingsAction = () => {
  closeMoreMenu();
  settingsShow.value = !settingsShow.value;
};
const otherNetworksAction = () => {
  closeMoreMenu();
  addNetworkShow.value = !addNetworkShow.value;
};
const toggleMoreMenu = () => {
  if (timeout != null) {
    clearTimeout(timeout);

    timeout = null;
  }
  if (isOpenMore.value) {
    closeMoreMenu();
  } else {
    isOpenMore.value = true;
  }
};
const closeMoreMenu = () => {
  if (timeout != null) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    isOpenMore.value = false;
  }, 50);
};
onClickOutside(
  dropdown,
  () => {
    closeMoreMenu();
  },
  { ignore: [toggle] },
);
const setIsPinnedNetwork = async (network: string, isPinned: boolean) => {
  try {
    await networksState.setNetworkStatus(network, isPinned);
    await setActiveNetworks();
  } catch (error) {
    console.error('Failed to set pined network:', error);
  }
};

const setIsToggledTestNetwork = async () => {
  try {
    await setActiveNetworks();
  } catch (error) {
    console.error('Failed to set is toggled test network:', error);
  }
};
</script>

<style lang="less">
@import './styles/theme.less';
@import (css)
  url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
}
.app {
  width: 800px;
  height: 600px;
  overflow: hidden;
  position: relative;
  -webkit-transition:
    width 0.3s ease-in,
    height 0.3s ease-in;
  -moz-transition:
    width 0.3s ease-in,
    height 0.3s ease-in;
  -ms-transition:
    width 0.3s ease-in,
    height 0.3s ease-in;
  -o-transition:
    width 0.3s ease-in,
    height 0.3s ease-in;
  transition:
    width 0.3s ease-in,
    height 0.3s ease-in;

  &__loading {
    width: 800px;
    height: 600px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: relative;
    background: radial-gradient(
        100% 50% at 100% 50%,
        rgba(250, 250, 250, 0.92) 0%,
        rgba(250, 250, 250, 0.98) 100%
      )
      @primary;

    svg {
      width: 132px;
      position: relative;
      z-index: 2;
    }
  }
  &__menu {
    width: 340px;
    height: 600px;
    position: absolute;
    left: 0;
    top: 0;
    padding: 8px 12px 2px 12px;
    box-sizing: border-box;
    z-index: 1;
    background: @defaultGradient;
    box-shadow: inset -1px 0px 2px 0px rgba(0, 0, 0, 0.16);
    &-logo {
      margin-left: 8px;
    }
    &-updated {
      height: 24px;
      width: 90px;
      cursor: pointer;
      transition: 0.3s;
      filter: brightness(1);
      &:hover {
        filter: brightness(0.9);
      }
    }

    &-row {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
    }

    &-add {
      display: flex;
      box-sizing: border-box;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      height: 40px;
      padding: 10px 16px 10px 8px;
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      text-decoration: none;
      cursor: pointer;
      border-radius: 10px;
      transition: background 300ms ease-in-out;

      &.active,
      &:hover {
        background: @black007;
      }

      svg {
        margin-right: 8px;
      }
    }

    &-link {
      display: inline-block;
      padding: 8px;
      margin-left: 4px;
      text-decoration: none;
      cursor: pointer;
      font-size: 0;
      border-radius: 10px;
      transition: background 300ms ease-in-out;

      &.active,
      &:hover {
        background: @black007;
      }
    }

    &-dropdown {
      padding: 8px;
      position: relative;
      width: 172px;
      background: @white;
      box-shadow:
        0px 0.5px 5px rgba(0, 0, 0, 0.039),
        0px 3.75px 11px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
      position: absolute;
      right: 8px;
      top: 48px;
      z-index: 3;

      &-divider {
        height: 1px;
        width: 90%;
        margin: 8px;
        background: @gray02;
      }

      &-link {
        width: 100%;
        height: 48px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        cursor: pointer;
        transition: background 300ms ease-in-out;
        border-radius: 8px;

        &-heart {
          width: 18px !important;
          height: 18px !important;
          margin-right: 16px !important;
          margin-left: 16px !important;
        }

        &:hover,
        &.active {
          background: rgba(0, 0, 0, 0.04);
        }

        svg {
          margin-right: 12px;
          margin-left: 12px;
        }

        span {
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.25px;
          color: @primaryLabel;
        }
      }
    }
  }

  &__content {
    width: 460px;
    height: 600px;
    position: relative;
    padding-left: 340px;
  }
}
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}
.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}
</style>
