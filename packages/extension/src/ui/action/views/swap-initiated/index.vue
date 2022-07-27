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
            Once completed, COMP will be deposited to the address you specified.
          </p>
        </div>
        <div class="swap-initiated__info">
          <swap-initiated-amount :token="ethereum" :amount="10">
          </swap-initiated-amount>
          <div class="swap-initiated__info-arrow">
            <arrow-down />
          </div>
          <swap-initiated-amount :token="ethereum" :amount="129.634">
          </swap-initiated-amount>
        </div>

        <div class="swap-initiated__buttons">
          <a href="#">View progress</a>
          <a @click="close">Close</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import LottieSwapInitiated from "@action/assets/animation/swap-initiated.json";
import ArrowDown from "@action/icons/send/arrow-down.vue";
import SwapInitiatedAmount from "./components/swap-initiated-amount.vue";
import { ethereum } from "@action/types/mock";

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});
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
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    z-index: 102;
    overflow: hidden;
  }
  &__animation {
    width: 100%;
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
      margin: 0 0 32px 0;
    }
  }
  &__info {
    width: 100%;
    height: 136px;
    padding: 0 16px 16px 16px;
    box-sizing: border-box;
    &-arrow {
      padding: 8px 0 8px 20px;
    }
  }
  &__loading {
    width: 72px;
    height: 48px;
    margin-bottom: 8px;
    margin-top: 32px;
  }
  &__buttons {
    padding: 0 32px 32px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    a {
      width: 128px;
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
      transition: background 300ms ease-in-out;
      cursor: pointer;

      &:last-child {
        width: 112px;
      }

      &:hover {
        background: @black007;
      }
    }
  }
}
</style>
