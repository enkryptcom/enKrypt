<template>
  <div class="swap-looking__container">
    <div class="swap-looking__overlay" @click="close()" />
    <div class="swap-looking__wrap">
      <a class="swap-looking__close" @click="close()">
        <close-icon />
      </a>

      <Vue3Lottie
        v-if="error === SwapError.SOME_TOKENS"
        :loop="true"
        :animation-data="LottieWarning"
        class="swap-looking__animation"
      />
      <Vue3Lottie
        v-else-if="
          error === SwapError.NO_TOKENS || error === SwapError.NO_TRADES
        "
        :loop="true"
        :animation-data="LottieError"
        class="swap-looking__animation"
      />
      <Vue3Lottie
        v-else-if="error === SwapError.NETWORK_NOT_SUPPORTED"
        :loop="true"
        :animation-data="LottieWarning"
        class="swap-looking__animation"
      />

      <h3 v-if="error !== SwapError.NETWORK_NOT_SUPPORTED">
        {{ Errors[error!].title }}
      </h3>
      <p v-if="error !== SwapError.NETWORK_NOT_SUPPORTED">
        {{ Errors[error!].description }}
      </p>

      <h3 v-if="error === SwapError.NETWORK_NOT_SUPPORTED">
        Coming soon to<br />{{ networkName }}
      </h3>
      <p v-if="error === SwapError.NETWORK_NOT_SUPPORTED">
        Can't wait to swap? Try swapping on {{ supportedNets }}.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";
import LottieWarning from "@action/assets/animation/warning.json";
import LottieError from "@action/assets/animation/error-big.json";
import { Vue3Lottie } from "vue3-lottie";
import { getSupportedNetworks } from "@enkryptcom/swap";
import { SwapError, Errors } from "./types";

interface IProps {
  error?: SwapError;
  networkName: string;
  close: () => void;
}
const supportedNets = getSupportedNetworks()
  .map((net) => net.name)
  .join(", ");
defineProps<IProps>();
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.swap-looking {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 320px;
    height: auto;
    z-index: 107;
    position: relative;
    overflow-x: hidden;
    padding: 24px;
    text-align: center;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      text-align: center;
      color: @primaryLabel;
      margin: 0 0 8px 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      color: @secondaryLabel;
      margin: 0 0 8px 0;
    }
  }

  &__container {
    width: 800px;
    height: 600px;
    left: 0px;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__animation {
    width: 180px;
    height: 180px;
    display: inline-block;
    margin-bottom: 24px;
  }
}
</style>
