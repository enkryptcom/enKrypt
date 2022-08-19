<template>
  <div class="swap-initiated__container">
    <div class="swap-initiated">
      <div class="swap-initiated__wrap">
        <div class="swap-initiated__animation">
          <Vue3Lottie
            class="swap-initiated__loading"
            :animation-data="LottieSwapInitiated"
            :loop="false"
          />

          <h4>Swap initiated</h4>
          <p>
            Once completed, {{ toToken.symbol }} will be deposited to the
            address you specified.
          </p>
          <a @click="close">Finish</a>
        </div>
        <div class="swap-initiated__info">
          <swap-initiated-amount :token="fromToken" :amount="fromAmount" />
          <div class="swap-initiated__info-arrow">
            <arrow-down />
          </div>
          <swap-initiated-amount :token="toToken" :amount="toAmount" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LottieSwapInitiated from "@action/assets/animation/swap-initiated.json";
import ArrowDown from "@action/icons/send/arrow-down.vue";
import SwapInitiatedAmount from "./components/swap-initiated-amount.vue";
import { BaseToken } from "@/types/base-token";

interface IProps {
  fromToken: BaseToken;
  toToken: BaseToken;
  fromAmount: string;
  toAmount: string;
}

const emit = defineEmits<{
  (e: "update:close"): void;
}>();

defineProps<IProps>();

const close = () => {
  emit("update:close");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.swap-initiated {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  &__container {
    width: 800px;
    height: 600px;
    background: rgba(0, 0, 0, 0.32);
    margin: 0;
    box-sizing: border-box;
    position: absolute;
    left: -340px;
    z-index: 101;
    top: 0;
  }
  &__wrap {
    position: relative;
    background: @white;
    width: 320px;
    height: 432px;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    z-index: 102;
    overflow: hidden;
  }
  &__animation {
    width: 100%;
    height: 264px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0 32px;
    box-sizing: border-box;

    h4 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      text-align: center;
      color: @primaryLabel;
      margin: 0 0 16px 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0 0 16px 0;
    }

    a {
      width: 156px;
      height: 40px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 10px;
      display: inline-block;
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 40px;
      letter-spacing: 0.5px;
      text-align: center;
      color: @primaryLabel;
      text-decoration: none;
      cursor: pointer;
    }
  }
  &__info {
    width: 100%;
    height: 168px;
    background-color: @lightBg;
    padding: 16px;
    box-sizing: border-box;
    &-arrow {
      padding-left: 20px;
    }
  }
  &__loading {
    width: 72px;
    height: 48px;
    margin-bottom: 8px;
  }
  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }
}
</style>
