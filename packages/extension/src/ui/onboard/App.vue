<template>
  <div class="onboard__container">
    <logo class="onboard__logo" />
    <div class="onboard__wrap" :class="wrapClassObject()">
      <a
        v-if="isShowBackButton()"
        class="onboard__back"
        @click="$router.go(-1)"
      >
        <arrow-back />
      </a>
      <router-view />
    </div>

    <div
      v-if="
        $route.name == 'create-wallet-wallet-ready' ||
        $route.name == 'restore-wallet-wallet-ready'
      "
      class="onboard__info"
    >
      <h4>Pin the Enkrypt extension</h4>
      <p>Click on <extension-icon /> in your browser</p>
      <p>
        Find <online-icon class="onboard__online" /> Enkrypt and click
        <pin-icon /> to pin it
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from "@action/icons/common/logo.vue";
import ArrowBack from "@action/icons/common/arrow-back.vue";
import ExtensionIcon from "@action/icons/tip/extension-icon.vue";
import OnlineIcon from "@action/icons/tip/online-icon.vue";
import PinIcon from "@action/icons/tip/pin-icon.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isShowBackButton = () => {
  return (
    route.name &&
    route.name != "new-wallet" &&
    route.name != "create-wallet-wallet-ready" &&
    route.name != "restore-wallet-wallet-ready" &&
    !(route.name as string).includes("hardware-wallet")
  );
};

const wrapClassObject = () => {
  return {
    "onboard__wrap--ready":
      route.name == "create-wallet-wallet-ready" ||
      route.name == "restore-wallet-wallet-ready",
    "onboard__wrap--auto-height": route.path.match(/hardware-wallet/),
  };
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import (css)
  url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap");

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  font-size: 0;
  font-family: "Roboto", sans-serif;
}

.onboard {
  &__logo {
    position: absolute;
    left: 32px;
    top: 24px;
  }

  &__back {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__container {
    background-color: @lightBg;
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  &__wrap {
    width: 460px;
    height: 600px;
    background: @white;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    padding: 56px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;

    &--ready {
      background: transparent;
      box-shadow: none;
    }

    &--auto-height {
      height: auto;
      max-height: 600px;
    }
  }

  &__info {
    position: absolute;
    right: 8px;
    top: 8px;
    background: @tip;
    border: 1px solid rgba(0, 0, 0, 0.1);
    width: 301px;
    height: 96px;
    border-radius: 10px;
    padding: 12px 20px;
    box-sizing: border-box;

    h4 {
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @black07;
      margin: 0;
    }
  }

  &__online {
    width: 16px;
    height: 16px;
  }
}
</style>
