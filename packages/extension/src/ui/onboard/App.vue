<template>
  <div class="onboard__container">
    <logo class="onboard__logo"></logo>
    <div
      class="onboard__wrap"
      :class="{ 'onboard__wrap--ready': $route.name == 'create-wallet-wallet-ready' || $route.name == 'restore-wallet-wallet-ready' }"
    >
      <a
        v-if="$route.name != 'new-wallet' && $route.name != 'create-wallet-wallet-ready' && $route.name != 'restore-wallet-wallet-ready'"
        class="onboard__back"
        @click="$router.go(-1)"
      >
        <arrow-back />
      </a>
      <router-view />
    </div>

    <div
      class="onboard__info"
      v-if="$route.name == 'create-wallet-wallet-ready' || $route.name == 'restore-wallet-wallet-ready'"
    >
      <h4>Pin the Enkrypt extension</h4>
      <p>Click on <extension-icon /> in your browser</p>
      <p>Find <online-icon /> Enkrypt and click <pin-icon /> to pin it</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from "@action/icons/common/logo.vue";
import ArrowBack from "@action/icons/common/arrow-back.vue";
import ExtensionIcon from "@action/icons/tip/extension-icon.vue";
import OnlineIcon from "@action/icons/tip/online-icon.vue";
import PinIcon from "@action/icons/tip/pin-icon.vue";
</script>

<style lang="less">
@import "~@action/styles/theme.less";

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  font-size: 0;
}

.onboard {
  &__logo {
    position: absolute;
    left: 32px;
    top: 28px;
  }

  &__back {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;

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
}
</style>
