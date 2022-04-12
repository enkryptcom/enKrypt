<template>
  <div class="app">
    <div ref="appMenu" class="app__menu">
      <logo-min :selected="+route.params.id" class="app__menu-logo" />
      <base-search :is-border="false" />
      <app-menu
        :networks="networks"
        :selected="(route.params.id as string)"
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
        :selected="+route.params.id"
        :account="account"
      />
      <router-view v-slot="{ Component }" name="view">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <router-view name="modal"></router-view>
      <router-view name="accounts"></router-view>

      <network-menu v-show="showNetworkMenu()" :selected="+route.params.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, defineExpose, ref } from "vue";
import AppMenu from "./components/app-menu/index.vue";
import NetworkMenu from "./components/network-menu/index.vue";
import NetworkHeader from "./components/network-header/index.vue";
import BaseSearch from "./components/base-search/index.vue";
import LogoMin from "./icons/common/logo-min.vue";
import AddIcon from "./icons/common/add-icon.vue";
import SettingsIcon from "./icons/common/settings-icon.vue";
import HoldIcon from "./icons/common/hold-icon.vue";
import { useRouter, useRoute } from "vue-router";
import { singleAccount } from "@action/types/mock";
import { Account } from "@action/types/account";
import { WindowPromise } from "@/libs/window-promise";
import { NodeType } from "@/types/provider";
import { getAllNetworks } from "@/libs/utils/networks";
import less from "less";

const appMenu = ref(null);
defineExpose({ appMenu });
const router = useRouter();
const route = useRoute();

onMounted(() => {
  router.push({ name: "activity", params: { id: 1 } });
});
const transitionName = "fade";
const account: Account = singleAccount;
const networks: NodeType[] = getAllNetworks();
const setNetwork = (network: NodeType) => {
  //hack may be there is a better way less.modifyVars doesnt work
  appMenu.value.style.background = `radial-gradient(100% 50% at 100% 50%, rgba(250, 250, 250, 0.92) 0%, rgba(250, 250, 250, 0.98) 100%), ${network.gradient}`;
  router.push({ name: "activity", params: { id: network.name } });
};
const addNetwork = () => {
  router.push({ name: "add-network" });
};

const showNetworkMenu = () => {
  const selected = +route.params.id;

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
