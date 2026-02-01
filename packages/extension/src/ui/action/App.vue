<template>
  <div>
    <div
      :class="['app', 'restricted-container', 'expanded']"
      v-if="isAddressRestricted.isRestricted || geoRestricted"
    >
      <restricted
        :isInitialized="isWalletInitialized"
        :is-address-restricted="isAddressRestricted.isRestricted"
        :restricted-address="isAddressRestricted.address"
        @restricted:switch-account="switchToUnrestrictedAddress"
      />
    </div>
    <div :class="[{ locked: isLocked }, 'app']" v-else>
      <div
        v-if="isLoading"
        :class="['app__loading', isExpanded ? 'expanded' : 'collapsed']"
      >
        <swap-looking-animation />
      </div>
      <div v-show="!isLoading">
        <app-menu
          :active-network="currentNetwork"
          @update:network="setNetwork"
          @show:updates-dialog="setShowUpdatesDialog(true)"
          @show:settings-dialog="settingsShow = true"
          @show:other-networks-dialog="addNetworkShow = true"
          @action:lock-enkrypt="lockAction"
        />
      </div>

      <div
        v-show="!isLoading"
        :class="[
          isExpanded ? 'app__content-expand' : 'app__content-collapse',
          'app__content',
        ]"
      >
        <accounts-header
          v-show="showNetworkMenu"
          :account-info="accountHeaderData"
          :network="currentNetwork"
          :show-deposit="showDepositWindow"
          @update:init="init"
          @address-changed="onSelectedAddressChanged"
          @select:subnetwork="onSelectedSubnetworkChange"
          @toggle:deposit="toggleDepositWindow"
          @action:generate-new-spark="generateNewSparkAddress"
        />
        <router-view v-slot="{ Component }" name="view">
          <transition :name="transitionName" mode="out-in">
            <component
              :is="Component"
              :key="route.fullPath"
              :is-syncing="isSyncing"
              :network="currentNetwork"
              :subnetwork="currentSubNetwork"
              :account-info="accountHeaderData"
              @update:init="init"
              @toggle:deposit="toggleDepositWindow"
              @open:buy-action="openBuyPage"
              @action:generate-new-spark="generateNewSparkAddress"
              @update:spark-state-changed="getSparkAccountState"
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
      />
      <settings
        v-if="settingsShow"
        @close:popup="settingsShow = !settingsShow"
        @action:lock="lockAction"
      />
      <modal-rate v-model="isRatePopupOpen" />
      <modal-new-version
        v-if="updateShow"
        :current-version="currentVersion"
        :latest-version="latestVersion"
        @close:popup="updateShow = !updateShow"
      />
      <modal-updates
        v-if="updatesIsLoaded && showUpdatesDialog"
        :current-version="currentVersion"
        :current-network="currentNetwork.name"
        @close:popup="setShowUpdatesDialog(false)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DomainState from '@/libs/domain-state';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import { BuyEventType, NetworkChangeEvents } from '@/libs/metrics/types';
import RateState from '@/libs/rate-state';
import {
  getAccountsByNetworkName,
  getOtherSigners,
} from '@/libs/utils/accounts';
import { DEFAULT_EVM_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import openOnboard from '@/libs/utils/open-onboard';
import BTCAccountState from '@/providers/bitcoin/libs/accounts-state';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet';
import EVMAccountState from '@/providers/ethereum/libs/accounts-state';
import { MessageMethod } from '@/providers/ethereum/types';
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import { MessageMethod as KadenaMessageMethod } from '@/providers/kadena/types';
import SolAccountState from '@/providers/solana/libs/accounts-state';
import { BaseNetwork } from '@/types/base-network';
import { InternalMethods } from '@/types/messenger';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { EnkryptAccount, NetworkNames } from '@enkryptcom/types';
import { fromBase } from '@enkryptcom/utils';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Browser from 'webextension-polyfill';
import AccountsHeader from './components/accounts-header/index.vue';
import AppMenu from './components/app-menu/index.vue';
import NetworkMenu from './components/network-menu/index.vue';
import Restricted from './views/restricted/index.vue';
import { AccountsHeaderData, SparkAccount } from './types/account';
import AddNetwork from './views/add-network/index.vue';
import ModalNewVersion from './views/modal-new-version/index.vue';
import ModalRate from './views/modal-rate/index.vue';
import Settings from './views/settings/index.vue';
import { useSynchronizeSparkState } from '@action/composables/synchronize-spark-state';
import ActivityState from '@/libs/activity-state';
import ModalUpdates from './views/updates/index.vue';
import { EnkryptProviderEventMethods, ProviderName } from '@/types/provider';
import SwapLookingAnimation from '@action/icons/swap/swap-looking-animation.vue';
import { trackBuyEvents, trackNetwork } from '@/libs/metrics';
import { getLatestEnkryptVersion } from '@action/utils/browser';
import { gt as semverGT } from 'semver';
import { useUpdatesStore } from './store/updates-store';
import { useNetworksStore } from './store/networks-store';
import { storeToRefs } from 'pinia';
import BackupState from '@/libs/backup-state';
import { useMenuStore } from './store/menu-store';
import { useCurrencyStore, type Currency } from './views/settings/store';
import { useRateStore } from './store/rate-store';
import { isGeoRestricted, isWalletRestricted } from '@/libs/utils/screening';
import { ActivityStatus, ActivityType } from '@/types/activity';

const wallet = new PublicFiroWallet();
const db = new IndexedDBHelper();
const domainState = new DomainState();
const rateState = new RateState();
const backupState = new BackupState();
const activityState = new ActivityState();

const defaultNetwork = DEFAULT_EVM_NETWORK;
const currentVersion = __PACKAGE_VERSION__;

const showDepositWindow = ref(false);
const accountHeaderData = ref<AccountsHeaderData>({
  activeAccounts: [],
  inactiveAccounts: [],
  selectedAccount: null,
  activeBalances: [],
  sparkAccount: null,
});

const router = useRouter();
const route = useRoute();
const transitionName = 'fade';
const currentNetwork = ref<BaseNetwork>(defaultNetwork);
const currentSubNetwork = ref<string>('');
const kr = new PublicKeyRing();
const addNetworkShow = ref(false);
const settingsShow = ref(false);
const updateShow = ref(false);
const isLoading = ref(true);
const isSyncing = ref(false);
const latestVersion = ref('');
const geoRestricted = ref(false);
const isWalletInitialized = ref(false);
const isAddressRestricted = ref<{ isRestricted: boolean; address: string }>({
  isRestricted: false,
  address: '',
});

const { sparkUnusedTxDetails } = useSynchronizeSparkState(
  currentNetwork,
  sparkBalance => {
    if (sparkBalance && accountHeaderData.value.sparkAccount) {
      console.log('UPDATING BALANCE');

      accountHeaderData.value = {
        ...accountHeaderData.value,
        sparkAccount: {
          ...(accountHeaderData.value.sparkAccount ?? {}),
          sparkBalance: {
            availableBalance: sparkBalance || '0',
          },
        },
      };
    }
  },
);

console.log('sparkUnusedTxDetails', sparkUnusedTxDetails);

watch(
  [sparkUnusedTxDetails, currentNetwork],
  () => {
    const network = currentNetwork.value;
    const selectedAccount = accountHeaderData.value.selectedAccount;
    const details = sparkUnusedTxDetails.value;

    console.log('Watching sparkUnusedTxDetails change', details);
    if (
      network.name !== NetworkNames.Firo ||
      !selectedAccount ||
      !details.length
    ) {
      return;
    }

    sparkUnusedTxDetails.value.forEach(txDetail => {
      if (!txDetail || !txDetail.vin.length || !txDetail.vout.length) {
        return;
      }
      console.log('txDetail', txDetail);
      activityState.addActivities(
        [
          {
            network: currentNetwork.value.name,
            from: 'Hidden',
            to: 'Hidden',
            isIncoming: false,
            status: ActivityStatus.success,
            timestamp: txDetail.time * 1000,
            type: ActivityType.spark_transaction,
            value: 'Hidden',
            transactionHash: txDetail.txid,
            token: {
              icon: currentNetwork.value.icon,
              symbol: currentNetwork.value.currencyName,
              name: currentNetwork.value.currencyName,
              decimals: currentNetwork.value.decimals,
            },
          },
        ],
        {
          address: network.displayAddress(selectedAccount.address),
          network: network.name,
        },
      );
    });
    // const activityAddress = network.displayAddress(selectedAccount.address);
    // const token = {
    //   name: network.name_long,
    //   symbol: network.currencyName,
    //   icon: network.icon,
    //   decimals: network.decimals,
    //   price: '0',
    // };
    // const activities = details.map(tx =>
    //   mapFiroExplorerTxToActivity(
    //     tx,
    //     activityAddress,
    //     network.name,
    //     token,
    //   ),
    // );
    // void activityState.addActivities(activities, {
    //   address: activityAddress,
    //   network: network.name,
    // });
  },
  { deep: true },
);

/** -------------------
 * Rate
 -------------------*/
const rateStore = useRateStore();
const { isRatePopupOpen } = storeToRefs(rateStore);
const { toggleRatePopup } = rateStore;
/** -------------------
 * Exapnded Menu
 -------------------*/
const menuStore = useMenuStore();
const { isExpanded } = storeToRefs(menuStore);

/** -------------------
 * Currency
 -------------------*/
const currencyStore = useCurrencyStore();
const { setCurrencyList } = currencyStore;

/** -------------------
 * Updates
 -------------------*/
const updatesStore = useUpdatesStore();
const { updatesIsLoaded } = storeToRefs(updatesStore);
const showUpdatesDialog = ref<boolean>(false);
const setShowUpdatesDialog = (show: boolean) => {
  showUpdatesDialog.value = show;
  if (show) {
    updatesStore.setLastVersionViewed(currentVersion);
  }
};

/**  -------------------
 * Networks
 -------------------*/

const networksStore = useNetworksStore();

/** -------------------
 * Core
 -------------------*/

const toggleDepositWindow = () => {
  showDepositWindow.value = !showDepositWindow.value;
};
const openBuyPage = () => {
  const buyLink = (() => {
    switch (currentNetwork.value.name) {
      case NetworkNames.Massa:
        return 'https://www.massa.net/get-mas';
      default:
        return `https://ccswap.myetherwallet.com/?to=${currentNetwork.value.displayAddress(
          accountHeaderData.value.selectedAccount!.address,
        )}&network=${currentNetwork.value.name}&crypto=${
          currentNetwork.value.currencyName
        }&platform=enkrypt`;
    }
  })();
  Browser.tabs.create({ url: buyLink });
  trackBuyEvents(BuyEventType.BuyClick, { network: currentNetwork.value.name });
};

const isKeyRingLocked = async (): Promise<boolean> => {
  return await sendToBackgroundFromAction({
    message: JSON.stringify({ method: InternalMethods.isLocked, params: [] }),
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
  await networksStore.setActiveNetworks();
  backupState.backup(true).catch(console.error);
  isLoading.value = false;
};

const fetchAndSetRates = async () => {
  const rates = await fetch(
    'https://mainnet.mewwallet.dev/v2/prices/exchange-rates?includeImages=true',
  );
  const ratesJson = await rates.json();
  setCurrencyList(
    ratesJson.filter((currency: Currency) => {
      if (
        currency.fiat_currency !== 'XAG' &&
        currency.fiat_currency !== 'XAU' &&
        currency.fiat_currency !== 'XDR' &&
        currency.fiat_currency !== 'BTC'
      ) {
        return currency;
      }
    }),
  );
};

onMounted(async () => {
  geoRestricted.value = await isGeoRestricted();
  const isInitialized = await kr.isInitialized();
  isWalletInitialized.value = isInitialized;
  if (geoRestricted.value) return;
  if (isInitialized) {
    const _isLocked = await isKeyRingLocked();
    if (_isLocked) {
      router
        .push({ name: 'lock-screen' })
        .then(() => (isLoading.value = false));
    } else {
      init();
      setTimeout(() => {
        rateState.showPopup().then(show => {
          if (show) {
            toggleRatePopup(true);
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
    updatesStore.init();
    menuStore.init();
    fetchAndSetRates();
  } else {
    openOnboard().then(() => {
      window.close();
    });
  }
});

/**
 * Update the gradient of the app menu on the active network change
 */

const generateNewSparkAddress = async () => {
  wallet.skipAddress();
  const defaultAddress = await wallet.getSparkAddressAsync();

  if (accountHeaderData.value.sparkAccount && defaultAddress) {
    accountHeaderData.value.sparkAccount.defaultAddress = defaultAddress;
  }
};

const getSparkAccountState = async (network: BaseNetwork) => {
  if (network.name === NetworkNames.Firo) {
    const defaultAddress = await wallet.getSparkAddressAsync();
    await db.waitInit();
    const availableBalance = await db.readData<string>(
      DB_DATA_KEYS.sparkBalance,
    );
    if (defaultAddress) {
      accountHeaderData.value.sparkAccount = {
        defaultAddress,
        sparkBalance: { availableBalance },
      };
    }
  }
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

  const sparkAccount = {} as SparkAccount;

  if (network.name === NetworkNames.Firo) {
    const defaultAddress = await wallet.getSparkAddressAsync();

    await db.waitInit();
    const availableBalance =
      (await db.readData<string>(DB_DATA_KEYS.sparkBalance)) || '0';

    if (defaultAddress) {
      sparkAccount['defaultAddress'] = defaultAddress;
    }
    sparkAccount['sparkBalance'] = { availableBalance };
  }

  accountHeaderData.value = {
    activeAccounts,
    inactiveAccounts,
    selectedAccount,
    activeBalances: activeAccounts.map(() => '~'),
    sparkAccount,
  };

  currentNetwork.value = network;
  checkAddress(selectedAccount);
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

const checkAddress = async (activeAccount: EnkryptAccount) => {
  isAddressRestricted.value = {
    isRestricted: false,
    address: '',
  };
  const isRestricted = await isWalletRestricted(
    currentNetwork.value.displayAddress(activeAccount.address),
  );
  if (isRestricted) {
    isAddressRestricted.value = {
      isRestricted,
      address: currentNetwork.value.displayAddress(activeAccount.address),
    };
  }
};

const onSelectedSubnetworkChange = async (id: string) => {
  await domainState.setSelectedSubNetwork(id);
  currentSubNetwork.value = id;
  setNetwork(currentNetwork.value);
};

const onSelectedAddressChanged = async (newAccount: EnkryptAccount) => {
  accountHeaderData.value.selectedAccount = newAccount;
  await checkAddress(newAccount);
  if (!isAddressRestricted.value.isRestricted) {
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
  }
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

const switchToUnrestrictedAddress = () => {
  const newAccount = accountHeaderData.value.activeAccounts.find(
    aa =>
      currentNetwork.value.displayAddress(aa.address) !==
      isAddressRestricted.value.address,
  );
  if (newAccount) onSelectedAddressChanged(newAccount);
};

const isLocked = computed(() => {
  return route.name == 'lock-screen';
});

/** -------------------
 * Menu Actions
 * ------------------- */

const lockAction = async () => {
  sendToBackgroundFromAction({
    message: JSON.stringify({ method: InternalMethods.lock }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  });
  router.push({ name: 'lock-screen' });
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

.collapsed {
  width: 516px;
}

.expanded {
  width: 800px;
}

.app {
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

  &__content {
    width: 460px;
    height: 600px;
    position: relative;

    &-expand {
      padding-left: 340px;
    }

    &-collapse {
      padding-left: 56px;
    }
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

.restricted-container {
  width: 800px;
  height: 600px;
}
</style>
