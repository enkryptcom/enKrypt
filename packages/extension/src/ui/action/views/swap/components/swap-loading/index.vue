<template>
  <div class="swap-looking__container">
    <div class="swap-looking__overlay" @click="close()" />
    <div class="swap-looking__wrap">
      <a v-if="showClose" class="swap-looking__close" @click="close()">
        <close-icon />
      </a>

      <swap-looking-animation class="swap-looking__animation" />
      <section
        v-if="loadingType === SWAP_LOADING.LOOKING_FOR_OFFERS"
        class="container"
      >
        <h3>Looking for the<br />best offer</h3>
        <p>Analyzing exchanges and network fees...</p>
      </section>
      <section v-if="loadingType === SWAP_LOADING.LOADING" class="container">
        <h3>Getting ready to<br />swap</h3>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";
import SwapLookingAnimation from "@action/icons/swap/swap-looking-animation.vue";
import { SWAP_LOADING } from "../../types";
interface Props {
  close: () => void;
  showClose?: boolean;
  loadingType: SWAP_LOADING;
}
withDefaults(defineProps<Props>(), {
  loadingType: SWAP_LOADING.LOADING,
  showClose: false,
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.container {
  display: contents;
}
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
    width: 152px;
    height: 152px;
    display: inline-block;
    margin-bottom: 24px;
  }
}
</style>
