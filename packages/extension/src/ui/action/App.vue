<template>
  <div class="app">
    <div class="app__menu" :class="classObject()">
      <logo-min :selected="+route.params.networkId" class="app__menu-logo" />
      <base-search :is-border="false" />
      <app-menu
        :networks="networks"
        :selected="+route.params.networkId"
        :set-network="setNetwork"
      />
      <br /><br />
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
      <network-header
        v-show="showNetworkMenu()"
        :selected="+route.params.networkId"
        :account="account"
      />

      <transition :name="transitionName" mode="out-in">
        <router-view name="view"></router-view>
      </transition>
      <router-view name="modal"></router-view>
      <router-view name="accounts"></router-view>

      <network-menu v-show="showNetworkMenu()" :selected="+route.params.networkId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppMenu from "./components/app-menu/index.vue";
import NetworkMenu from "./components/network-menu/index.vue";
import NetworkHeader from "./components/network-header/index.vue";
import BaseSearch from "./components/base-search/index.vue";
import LogoMin from "./icons/common/logo-min.vue";
import AddIcon from "./icons/common/add-icon.vue";
import SettingsIcon from "./icons/common/settings-icon.vue";
import HoldIcon from "./icons/common/hold-icon.vue";
import { NetworkItem } from "./types/network";
import { useRouter, useRoute } from "vue-router";
import { singleAccount, networkList } from "@action/types/mock";
import { Account } from "@action/types/account";
import { WindowPromise } from "@/libs/window-promise";

const router = useRouter();
const route = useRoute();

onMounted(() => {
  router.push({ name: "activity", params: { networkId: 1 } });
});
const transitionName = "fade";
const account: Account = singleAccount;
const networks: NetworkItem[] = networkList;
const setNetwork = (network: NetworkItem) => {
  router.push({ name: "activity", params: { networkId: network.id } });
};
const addNetwork = () => {
  router.push({ name: "add-network" });
};
const classObject = () => {
  const selected = +route.params.networkId;

  if (selected) {
    return {
      ethereum: selected == 1,
      polygon: selected == 2,
      polkadot: selected == 3,
      moonbeam: selected == 4,
    };
  }

  return {};
};
const showNetworkMenu = () => {
  const selected = +route.params.networkId;

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
      console.log(error);
    });
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

    &.ethereum {
      background: @ethereumGradient;
    }

    &.polygon {
      background: @polygonGradient;
    }

    &.polkadot {
      background: @polkadotGradient;
    }

    &.moonbeam {
      background: @moonbeamGradient;
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
