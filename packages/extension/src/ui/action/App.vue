<template>
  <div class="app">
    <div ref="appMenuRef" class="app__menu">
      <logo-min :color="networkGradient" class="app__menu-logo" />
      <base-search :input="searchInput" :is-border="false" />
      <app-menu
        :networks="networks"
        :selected="(route.params.id as string)"
        :set-network="setNetwork"
      />
      <br />
      <a href="javascript:void(0);" @click="openCreate()">
        to Create / Restore
      </a>
      <div class="app__menu-footer">
        <a class="app__menu-add" @click="addNetworkToggle()">
          <add-icon />
          Manage networks
        </a>

        <div>
          <a class="app__menu-link">
            <hold-icon />
          </a>

          <a class="app__menu-link" @click="settingsToggle()">
            <settings-icon />
          </a>
        </div>
      </div>
    </div>

    <div class="app__content">
      <accounts-header
        v-show="showNetworkMenu()"
        :account-info="accountHeaderData"
        :network="currentNetwork"
        :init="init"
        @address-changed="onSelectedAddressChanged"
      />
      <router-view v-slot="{ Component }" name="view">
        <transition :name="transitionName" mode="out-in">
          <component
            :is="Component"
            :network="currentNetwork"
            :account-info="accountHeaderData"
            :init="init"
          />
        </transition>
      </router-view>

      <network-menu
        v-show="showNetworkMenu()"
        :selected="(route.params.id as string)"
        :network="currentNetwork"
      />
    </div>

    <add-network
      v-show="addNetworkShow"
      :close="addNetworkToggle"
    ></add-network>

    <settings v-show="settingsShow" :close="settingsToggle"></settings>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppMenu from "./components/app-menu/index.vue";
import NetworkMenu from "./components/network-menu/index.vue";
import AccountsHeader from "./components/accounts-header/index.vue";
import BaseSearch from "./components/base-search/index.vue";
import LogoMin from "./icons/common/logo-min.vue";
import AddIcon from "./icons/common/add-icon.vue";
import SettingsIcon from "./icons/common/settings-icon.vue";
import HoldIcon from "./icons/common/hold-icon.vue";
import AddNetwork from "./views/add-network/index.vue";
import Settings from "./views/settings/index.vue";
import { useRouter, useRoute } from "vue-router";
import { WindowPromise } from "@/libs/window-promise";
import { NodeType } from "@/types/provider";
import {
  getAllNetworks,
  DEFAULT_NETWORK_NAME,
  getNetworkByName,
} from "@/libs/utils/networks";
import DomainState from "@/libs/domain-state";
import { getOtherSigners } from "@/libs/utils/accounts";
import { AccountsHeaderData } from "./types/account";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { KeyRecord } from "@enkryptcom/types";
import { sendToBackgroundFromAction } from "@/libs/messenger/extension";
import { EthereumNodeType, MessageMethod } from "@/providers/ethereum/types";
import { InternalMethods } from "@/types/messenger";
import openOnboard from "@/libs/utils/open-onboard";

const domainState = new DomainState();
const appMenuRef = ref(null);
const networkGradient = ref("");
const accountHeaderData = ref<AccountsHeaderData>({
  activeAccounts: [],
  inactiveAccounts: [],
  selectedAccount: null,
  activeBalances: [],
});
defineExpose({ appMenuRef });
const router = useRouter();
const route = useRoute();
const transitionName = "fade";
const networks: NodeType[] = getAllNetworks().filter(
  (net) => !net.isTestNetwork //hide testnetworks for now
);
const defaultNetwork = getNetworkByName(DEFAULT_NETWORK_NAME) as NodeType;
const currentNetwork = ref<NodeType>(defaultNetwork);
const kr = new PublicKeyRing();
const addNetworkShow = ref(false);
const settingsShow = ref(false);

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
    const savedNetwork = getNetworkByName(curNetwork);
    if (savedNetwork) setNetwork(savedNetwork);
    else setNetwork(defaultNetwork);
  } else {
    setNetwork(defaultNetwork);
  }
};
onMounted(async () => {
  const isInitialized = await kr.isInitialized();
  if (isInitialized) {
    const _isLocked = await isKeyRingLocked();
    if (_isLocked) {
      router.push({ name: "lock-screen" });
    } else {
      init();
    }
  } else {
    openOnboard();
  }
});
const setNetwork = async (network: NodeType) => {
  //hack may be there is a better way. less.modifyVars doesnt work
  if (appMenuRef.value)
    (
      appMenuRef.value as HTMLElement
    ).style.background = `radial-gradient(100% 50% at 100% 50%, rgba(250, 250, 250, 0.92) 0%, rgba(250, 250, 250, 0.98) 100%), ${network.gradient}`;
  networkGradient.value = network.gradient;
  const activeAccounts = await kr.getAccounts(network.signer);
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
  const tabId = await domainState.getCurrentTabId();
  if ((currentNetwork.value as EthereumNodeType).chainID) {
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
            params: [(currentNetwork.value as EthereumNodeType).chainID],
          },
        ],
      }),
      provider: currentNetwork.value.provider,
      tabId,
    });
  }
  router.push({ name: "activity", params: { id: network.name } });
  domainState.setSelectedNetwork(network.name);
  if (network.api) {
    try {
      const api = await network.api();
      const activeBalancePromises = activeAccounts.map((acc) =>
        api.getBaseBalance(acc.address)
      );
      Promise.all(activeBalancePromises).then((balances) => {
        accountHeaderData.value.activeBalances = balances;
      });
    } catch (e) {
      console.error(e);
    }
  }
};
const addNetworkToggle = () => {
  addNetworkShow.value = !addNetworkShow.value;
};
const settingsToggle = () => {
  settingsShow.value = !settingsShow.value;
};
const onSelectedAddressChanged = async (newAccount: KeyRecord) => {
  accountHeaderData.value.selectedAccount = newAccount;
  await domainState.setSelectedAddress(newAccount.address);
  await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.sendToTab,
      params: [
        {
          method: MessageMethod.changeAddress,
          params: [newAccount.address],
        },
      ],
    }),
    provider: currentNetwork.value.provider,
    tabId: await domainState.getCurrentTabId(),
  });
};
const showNetworkMenu = () => {
  const selected = route.params.id as string;
  return (
    !!selected &&
    (route.name == "activity" ||
      route.name == "assets" ||
      route.name == "nfts" ||
      route.name == "dapps")
  );
};
const openCreate = () => {
  const windowPromise = new WindowPromise();
  windowPromise
    .getResponse("onboard.html", JSON.stringify({ info: "test" }))
    .then(({ error }) => {
      console.error(error);
    });
};

const searchInput = (text: string) => {
  console.log(text);
};
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
      height: 40px;
      bottom: 8px;
      left: 0;
      padding: 0 12px;
      box-sizing: border-box;
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

      &.active,
      &:hover {
        background: @black007;
        border-radius: 10px;
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

      &.active,
      &:hover {
        background: @black007;
        border-radius: 10px;
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
