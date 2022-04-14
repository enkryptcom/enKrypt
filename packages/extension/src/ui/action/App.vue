<template>
  <div class="app">
    <div ref="appMenuRef" class="app__menu">
      <logo-min :color="networkGradient" class="app__menu-logo" />
      <base-search :is-border="false" />
      <app-menu
        :networks="networks"
        :selected="(route.params.id as string)"
        :set-network="setNetwork"
      />
      <br />
      <a href="javascript:void(0);" @click="openCreate()">
        to Cretate / Restore
      </a>
      <div class="app__menu-footer">
        <a
          class="app__menu-add"
          :class="{ active: $route.name == 'add-network' }"
          @click="addNetwork()"
        >
          <add-icon />
          Add a network
        </a>

        <div>
          <a class="app__menu-link">
            <hold-icon />
          </a>

          <a class="app__menu-link">
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
        @address-changed="onSelectedAddressChanged"
      />
      <router-view v-slot="{ Component }" name="view">
        <transition :name="transitionName" mode="out-in">
          <component
            :is="Component"
            :network="currentNetwork"
            :account-info="accountHeaderData"
          />
        </transition>
      </router-view>

      <network-menu
        v-show="showNetworkMenu()"
        :selected="(route.params.id as string)"
      />
    </div>
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
import { useRouter, useRoute } from "vue-router";
import { WindowPromise } from "@/libs/window-promise";
import { NodeType, ProviderName } from "@/types/provider";
import { getAllNetworks, DEFAULT_NETWORK_NAME } from "@/libs/utils/networks";
import TabState from "@/libs/tab-state";
import { getOtherSigners } from "@/libs/utils/accounts";
import { AccountsHeaderData } from "./types/account";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { KeyRecord } from "@enkryptcom/types";
import { sendToBackgroundFromAction } from "@/libs/messenger/extension";
import { EthereumNodeType, MessageMethod } from "@/providers/ethereum/types";

const tabstate = new TabState();
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
const defaultNetwork = networks.find(
  (net) => net.name === DEFAULT_NETWORK_NAME
) as NodeType;
const currentNetwork = ref<NodeType>(defaultNetwork);
const kr = new PublicKeyRing();

onMounted(async () => {
  const curNetwork = await tabstate.getSelectedNetWork();
  if (curNetwork) {
    const savedNetwork = networks.find((net) => net.name === curNetwork);
    if (savedNetwork) setNetwork(savedNetwork);
    else setNetwork(defaultNetwork);
  } else {
    setNetwork(defaultNetwork);
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
  const selectedAddress = await tabstate.getSelectedAddress();
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
  if ((currentNetwork.value as EthereumNodeType).chainID) {
    await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: MessageMethod.changeChainId,
        params: [(currentNetwork.value as EthereumNodeType).chainID],
      }),
      provider: currentNetwork.value.provider,
      tabId: await tabstate.getCurrentTabId(),
    });
  }
  router.push({ name: "activity", params: { id: network.name } });
  tabstate.setSelectedNetwork(network.name);
  if (network.api) {
    try {
      const api = await network.api();
      const activeBalancePromises = activeAccounts.map((acc) =>
        api.getBaseBalance(acc.address)
      );
      Promise.all(activeBalancePromises).then((balances) => {
        console.log(balances);
        accountHeaderData.value.activeBalances = balances;
      });
    } catch (e) {
      console.log(e);
    }
  }
};
const addNetwork = () => {
  router.push({ name: "add-network" });
};
const onSelectedAddressChanged = async (newAccount: KeyRecord) => {
  accountHeaderData.value.selectedAccount = newAccount;
  await tabstate.setSelectedAddress(newAccount.address);
  await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: MessageMethod.changeAddress,
      params: [newAccount.address],
    }),
    provider: currentNetwork.value.provider,
    tabId: await tabstate.getCurrentTabId(),
  });
};
const openCreate = () => {
  const windowPromise = new WindowPromise();
  windowPromise
    .getResponse("onboard.html", JSON.stringify({ info: "test" }))
    .then(({ error }) => {
      console.log(error);
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
</script>

<style lang="less">
@import "./styles/theme.less";

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
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

    // &.ethereum {
    //   background: @ethereumGradient;
    // }

    // &.polygon {
    //   background: @polygonGradient;
    // }

    // &.polkadot {
    //   background: @polkadotGradient;
    // }

    // &.moonbeam {
    //   background: @moonbeamGradient;
    // }

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
