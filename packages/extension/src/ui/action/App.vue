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
        @restricted:switch-account="switchToUnrestrictedAccount"
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
          @update:network="selectNetwork"
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
          :show-deposit="showDepositWindow"
          @toggle:deposit="toggleDepositWindow"
        />
        <router-view v-slot="{ Component }" name="view">
          <transition :name="transitionName" mode="out-in">
            <component
              :is="Component"
              :key="route.fullPath"
              @toggle:deposit="toggleDepositWindow"
              @open:buy-action="openBuyPage"
            />
          </transition>
        </router-view>

        <network-menu
          v-show="showNetworkMenu"
          :selected="route.params.id as string"
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
        @close:popup="setShowUpdatesDialog(false)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DomainState from '@/libs/domain-state';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import ModalNewVersion from './views/modal-new-version/index.vue';
import openOnboard from '@/libs/utils/open-onboard';
import { InternalMethods } from '@/types/messenger';
import { NetworkNames } from '@enkryptcom/types';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Browser from 'webextension-polyfill';
import AccountsHeader from './components/accounts-header/index.vue';
import AppMenu from './components/app-menu/index.vue';
import NetworkMenu from './components/network-menu/index.vue';
import AddNetwork from './views/add-network/index.vue';
import ModalRate from './views/modal-rate/index.vue';
import Settings from './views/settings/index.vue';
import ModalUpdates from './views/updates/index.vue';
import Restricted from './views/restricted/index.vue';
import RateState from '@/libs/rate-state';
import SwapLookingAnimation from '@action/icons/swap/swap-looking-animation.vue';
import { trackBuyEvents } from '@/libs/metrics';
import { getLatestEnkryptVersion } from '@action/utils/browser';
import { gt as semverGT } from 'semver';
import { useUpdatesStore } from './store/updates-store';
import { useNetworksStore } from './store/networks-store';
import { useAccountsStore } from './store/accounts-store';
import networkSelectionComposable from './composables/network-selection';
import { storeToRefs } from 'pinia';
import { BuyEventType } from '@/libs/metrics/types';
import { useMenuStore } from './store/menu-store';
import { useCurrencyStore, type Currency } from './views/settings/store';
import { useRateStore } from './store/rate-store';
import { isGeoRestricted } from '@/libs/utils/screening';

const domainState = new DomainState();
const rateState = new RateState();
const showDepositWindow = ref(false);

const router = useRouter();
const route = useRoute();
const transitionName = 'fade';
const kr = new PublicKeyRing();
const addNetworkShow = ref(false);
const settingsShow = ref(false);
const updateShow = ref(false);
const isLoading = ref(true);
const currentVersion = __PACKAGE_VERSION__;
const latestVersion = ref('');
const geoRestricted = ref(false);
const isWalletInitialized = ref(false);

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
const { currentNetwork } = storeToRefs(networksStore);
const { init: initSelection, selectNetwork } = networkSelectionComposable();

/**  -------------------
 * Accounts
 -------------------*/

const accountsStore = useAccountsStore();
const { selectedAccount, isAddressRestricted } = storeToRefs(accountsStore);
const { switchToUnrestrictedAccount } = accountsStore;

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
          selectedAccount.value!.address,
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
  try {
    await initSelection();
  } finally {
    isLoading.value = false;
  }
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
