<template>
  <div class="app" :class="{ locked: isLocked }">
    <div v-if="isLoading" class="app__loading">
      <swap-looking-animation />
    </div>
    <div v-show="!isLoading" ref="appMenuRef" class="app__menu">
      <logo-min class="app__menu-logo" />
      <base-search
        :value="searchInput"
        :is-border="false"
        @update:value="updateSearchValue"
      />
      <app-menu
        :networks="networks"
        :selected="(route.params.id as string)"
        :search-input="searchInput"
        @update:order="updateNetworkOrder"
        @update:network="setNetwork"
        @update:gradient="updateGradient"
      />
      <div class="app__menu-footer" :class="{ border: networks.length > 9 }">
        <a class="app__menu-add" @click="addNetworkShow = !addNetworkShow">
          <manage-networks-icon />
          Manage networks
        </a>
        <div>
          <a ref="toggle" class="app__menu-link" @click="toggleMoreMenu">
            <more-icon />
          </a>
          <div v-show="isOpenMore" ref="dropdown" class="app__menu-dropdown">
            <a class="app__menu-dropdown-link" @click="lockAction">
              <hold-icon /> <span>Lock Enkrypt</span>
            </a>
            <a class="app__menu-dropdown-link" @click="settingsAction">
              <settings-icon /> <span>Settings</span>
            </a>
          </div>
        </div>
      </div>
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
            :network="currentNetwork"
            :subnetwork="currentSubNetwork"
            :account-info="accountHeaderData"
            @update:init="init"
            @toggle:deposit="toggleDepositWindow"
            @open:buy-action="openBuyPage"
            @update:balance="onUpdatedBalance"
          />
        </transition>
      </router-view>

      <network-menu
        v-show="showNetworkMenu"
        :selected="(route.params.id as string)"
        :network="currentNetwork"
      />
    </div>

    <add-network
      v-show="addNetworkShow"
      @close:popup="addNetworkShow = !addNetworkShow"
      @update:active-networks="setActiveNetworks"
    />

    <settings v-if="settingsShow" @close:popup="settingsShow = !settingsShow" />
    <modal-rate v-if="rateShow" @close:popup="rateShow = !rateShow" />
  </div>
</template>

<script setup lang="ts">
import DomainState from "@/libs/domain-state";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { sendToBackgroundFromAction } from "@/libs/messenger/extension";
import { addNetworkSelectMetrics } from "@/libs/metrics";
import NetworksState from "@/libs/networks-state";
import RateState from "@/libs/rate-state";
import {
  getAccountsByNetworkName,
  getOtherSigners,
} from "@/libs/utils/accounts";
import {
  DEFAULT_EVM_NETWORK,
  getAllNetworks,
  getNetworkByName,
} from "@/libs/utils/networks";
import openOnboard from "@/libs/utils/open-onboard";
import BTCAccountState from "@/providers/bitcoin/libs/accounts-state";
import EVMAccountState from "@/providers/ethereum/libs/accounts-state";
import { MessageMethod } from "@/providers/ethereum/types";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { MessageMethod as KadenaMessageMethod } from "@/providers/kadena/types";
import { BaseNetwork } from "@/types/base-network";
import { InternalMethods } from "@/types/messenger";
import { ProviderName } from "@/types/provider";
import SwapLookingAnimation from "@action/icons/swap/swap-looking-animation.vue";
import { EnkryptAccount, NetworkNames } from "@enkryptcom/types";
import { fromBase } from "@enkryptcom/utils";
import { onClickOutside } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Browser from "webextension-polyfill";
import AccountsHeader from "./components/accounts-header/index.vue";
import AppMenu from "./components/app-menu/index.vue";
import BaseSearch from "./components/base-search/index.vue";
import NetworkMenu from "./components/network-menu/index.vue";
import MoreIcon from "./icons/actions/more.vue";
import HoldIcon from "./icons/common/hold-icon.vue";
import LogoMin from "./icons/common/logo-min.vue";
import ManageNetworksIcon from "./icons/common/manage-networks-icon.vue";
import SettingsIcon from "./icons/common/settings-icon.vue";
import { AccountsHeaderData } from "./types/account";
import AddNetwork from "./views/add-network/index.vue";
import ModalRate from "./views/modal-rate/index.vue";
import Settings from "./views/settings/index.vue";

const domainState = new DomainState();
const networksState = new NetworksState();
const rateState = new RateState();
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
const transitionName = "fade";
const searchInput = ref("");
const networks = ref<BaseNetwork[]>([]);
const defaultNetwork = DEFAULT_EVM_NETWORK;
const currentNetwork = ref<BaseNetwork>(defaultNetwork);
const currentSubNetwork = ref<string>("");
const kr = new PublicKeyRing();
const addNetworkShow = ref(false);
const settingsShow = ref(false);
const rateShow = ref(false);
const dropdown = ref(null);
const toggle = ref(null);
const isLoading = ref(true);

const setActiveNetworks = async () => {
  const activeNetworkNames = await networksState.getActiveNetworkNames();

  const allNetworks = await getAllNetworks();
  const networksToShow: BaseNetwork[] = [];

  activeNetworkNames.forEach((name) => {
    const network = allNetworks.find((network) => network.name === name);
    if (network !== undefined) networksToShow.push(network);
  });
  networks.value = networksToShow;

  if (!networks.value.includes(currentNetwork.value)) {
    setNetwork(networks.value[0]);
  }
};
const updateNetworkOrder = (newOrder: BaseNetwork[]) => {
  if (searchInput.value === "") networks.value = newOrder;
};
const updateSearchValue = (newval: string) => {
  searchInput.value = newval;
};
const toggleDepositWindow = () => {
  showDepositWindow.value = !showDepositWindow.value;
};
const openBuyPage = () => {
  const buyLink =
    currentNetwork.value.name === NetworkNames.KadenaTestnet
      ? (currentNetwork.value as any).options.buyLink
      : `https://ccswap.myetherwallet.com/?to=${currentNetwork.value.displayAddress(
          accountHeaderData.value.selectedAccount!.address
        )}`;

  Browser.tabs.create({
    url: buyLink,
  });
};
const isKeyRingLocked = async (): Promise<boolean> => {
  return await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.isLocked,
      params: [],
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  }).then((res) => JSON.parse(res.result || "true"));
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
  if (await rateState.showPopup()) {
    rateShow.value = true;
  }
  const isInitialized = await kr.isInitialized();
  if (isInitialized) {
    const _isLocked = await isKeyRingLocked();
    if (_isLocked) {
      router
        .push({ name: "lock-screen" })
        .then(() => (isLoading.value = false));
    } else {
      init();
    }
  } else {
    openOnboard();
  }
});
const updateGradient = (newGradient: string) => {
  //hack may be there is a better way. less.modifyVars doesnt work
  if (appMenuRef.value)
    (
      appMenuRef.value as HTMLElement
    ).style.background = `radial-gradient(137.35% 97% at 100% 50%, rgba(250, 250, 250, 0.94) 0%, rgba(250, 250, 250, 0.96) 28.91%, rgba(250, 250, 250, 0.98) 100%), linear-gradient(180deg, ${newGradient} 80%, #684CFF 100%)`;
};
const setNetwork = async (network: BaseNetwork) => {
  addNetworkSelectMetrics(network.provider, network.name, 1);
  const activeAccounts = await getAccountsByNetworkName(network.name);

  const inactiveAccounts = await kr.getAccounts(
    getOtherSigners(network.signer)
  );
  const selectedAddress = await domainState.getSelectedAddress();
  let selectedAccount = activeAccounts[0];
  if (selectedAddress) {
    const found = activeAccounts.find((acc) => acc.address === selectedAddress);
    if (found) selectedAccount = found;
  }

  accountHeaderData.value = {
    activeAccounts,
    inactiveAccounts,
    selectedAccount,
    activeBalances: activeAccounts.map(() => "~"),
  };
  currentNetwork.value = network;
  router.push({ name: "assets", params: { id: network.name } });
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

  domainState.setSelectedNetwork(network.name);

  if (network.api) {
    try {
      const thisNetworkName = currentNetwork.value.name;
      const api = await network.api();
      const activeBalancePromises = activeAccounts.map((acc) =>
        api.getBalance(acc.address)
      );
      Promise.all(activeBalancePromises).then((balances) => {
        if (thisNetworkName === currentNetwork.value.name)
          accountHeaderData.value.activeBalances = balances.map((bal) =>
            fromBase(bal, network.decimals)
          );
      });
    } catch (e) {
      console.error(e);
    }
  }
};

const onUpdatedBalance = async () => {
  try {
    const thisNetworkName = currentNetwork.value.name;
    const activeAccounts = await getAccountsByNetworkName(
      currentNetwork.value.name
    );
    const api = await currentNetwork.value.api();
    const activeBalancePromises = activeAccounts.map((acc) =>
      api.getBalance(acc.address)
    );

    Promise.all(activeBalancePromises).then((balances) => {
      if (thisNetworkName === currentNetwork.value.name)
        accountHeaderData.value.activeBalances = balances.map((bal: any) =>
          fromBase(bal, currentNetwork.value.decimals)
        );
    });
  } catch (e) {
    console.error(e);
  }
};

const onSelectedSubnetworkChange = async (id: string) => {
  await domainState.setSelectedSubNetwork(id);
  currentSubNetwork.value = id;
  setNetwork(currentNetwork.value);
};

const onSelectedAddressChanged = async (newAccount: EnkryptAccount) => {
  accountHeaderData.value.selectedAccount = newAccount;
  if (
    currentNetwork.value.provider === ProviderName.ethereum ||
    currentNetwork.value.provider === ProviderName.bitcoin
  ) {
    const AccountState =
      currentNetwork.value.provider === ProviderName.ethereum
        ? new EVMAccountState()
        : new BTCAccountState();
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
    (route.name == "activity" ||
      route.name == "assets" ||
      route.name == "nfts" ||
      route.name == "dapps")
  );
});
const isLocked = computed(() => {
  return route.name == "lock-screen";
});

const lockAction = async () => {
  sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.lock,
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  });
  router.push({ name: "lock-screen" });
};
const settingsAction = () => {
  closeMoreMenu();
  settingsShow.value = !settingsShow.value;
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
  { ignore: [toggle] }
);
</script>

<style lang="less">
@import "./styles/theme.less";
@import (css)
  url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap");

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: "Roboto", sans-serif;
}
.app {
  width: 800px;
  height: 600px;
  overflow: hidden;
  position: relative;
  -webkit-transition: width 0.3s ease-in, height 0.3s ease-in;
  -moz-transition: width 0.3s ease-in, height 0.3s ease-in;
  -ms-transition: width 0.3s ease-in, height 0.3s ease-in;
  -o-transition: width 0.3s ease-in, height 0.3s ease-in;
  transition: width 0.3s ease-in, height 0.3s ease-in;

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
    padding: 16px 12px 8px 12px;
    box-sizing: border-box;
    z-index: 1;
    background: @defaultGradient;

    &-logo {
      margin-left: 8px;
    }

    &-footer {
      position: absolute;
      width: 100%;
      height: 56px;
      bottom: 0;
      left: 0;
      padding: 0 12px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      background: rgba(255, 255, 255, 0.01);

      &.border {
        box-shadow: 0px 0px 6px -1px rgba(0, 0, 0, 0.05),
          0px 0px 1px rgba(0, 0, 0, 0.2);
      }
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
      box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
        0px 3.75px 11px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
      position: absolute;
      right: 8px;
      bottom: 52px;

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
