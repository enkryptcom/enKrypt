<template>
  <div>
    <div class="container">
      <div v-if="!!selected" class="swap">
        <div class="swap__header">
          <h3>Swap</h3>
          <a class="swap__close" @click="$router.go(-1)">
            <close-icon />
          </a>
        </div>

        <div class="swap__wrap">
          <swap-token-amount-input
            :toggle-select="toggleFromToken"
            :token="fromToken"
            :input-amount="inputAmountFrom"
          ></swap-token-amount-input>

          <div class="swap__arrows"><swap-arrows></swap-arrows></div>

          <swap-token-amount-input
            :toggle-select="toggleToToken"
            :token="toToken"
            :input-amount="inputAmountTo"
            :select-token="selectTokenTo"
          ></swap-token-amount-input>
        </div>

        <div class="swap__buttons">
          <div class="swap__buttons-cancel">
            <base-button title="Cancel" :gray="true" @click="$router.go(-1)" />
          </div>
          <div class="swap__buttons-send">
            <base-button
              :title="sendButtonTitle()"
              :click="sendAction"
              :disabled="isDisabled()"
            />
          </div>
        </div>
      </div>
    </div>

    <swap-token-list
      v-show="fromSelectOpened"
      :close="toggleFromToken"
      :select-token="selectTokenFrom"
    ></swap-token-list>

    <swap-token-list
      v-show="toSelectOpened"
      :close="toggleToToken"
      :select-token="selectTokenTo"
      :is-select-to-token="true"
    ></swap-token-list>

    <swap-looking v-show="isLooking" :close="toggleLooking"></swap-looking>
  </div>
</template>

<script lang="ts">
export default {
  name: "Swap",
};
</script>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SwapArrows from "@action/icons/swap/swap-arrows.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SwapTokenAmountInput from "./components/swap-token-amount-input/index.vue";
import SwapTokenList from "./components/swap-token-list/index.vue";
import SwapLooking from "./components/swap-looking/index.vue";
import { AssetsType } from "@/types/provider";

const ethereum: AssetsType = {
  name: "Ethereum",
  symbol: "eth",
  icon: "https://mpolev.ru/enkrypt/eth.png",
  balance: "0.5",
  balancef: "0.5",
  balanceUSD: 2500,
  balanceUSDf: "$2500",
  value: "100",
  valuef: "100",
  decimals: 1000,
  sparkline: "",
  priceChangePercentage: 0,
};

const router = useRouter();
const route = useRoute();

const selected: string = route.params.id as string;

defineProps({});

let fromToken = ref(ethereum);
let fromAmount = ref<number | null>(null);

let toToken = ref<AssetsType | null>(null);
let toAmount = ref<number | null>(null);

let fromSelectOpened = ref(false);
let toSelectOpened = ref(false);

let isLooking = ref(false);

const selectTokenFrom = (token: AssetsType) => {
  fromToken.value = token;
  fromSelectOpened.value = false;
};
const selectTokenTo = (token: AssetsType) => {
  toToken.value = token;
  toSelectOpened.value = false;
};
const inputAmountFrom = (newVal: number) => {
  fromAmount.value = newVal;
};
const inputAmountTo = (newVal: number) => {
  toAmount.value = newVal;
};
const toggleFromToken = () => {
  fromSelectOpened.value = !fromSelectOpened.value;
};
const toggleToToken = () => {
  toSelectOpened.value = !toSelectOpened.value;
};
const toggleLooking = () => {
  isLooking.value = !isLooking.value;
};
const sendButtonTitle = () => {
  let title = "Select  token";

  if (!!fromToken.value && !!toToken.value) {
    title = "Preview swap";
  }

  return title;
};
const isDisabled = () => {
  let isDisabled = true;

  if (
    !!fromToken.value &&
    !!toToken.value &&
    Number(fromAmount.value) > 0 &&
    Number(toAmount.value) > 0
  ) {
    isDisabled = false;
  }
  return isDisabled;
};
const sendAction = () => {
  toggleLooking();

  setTimeout(() => {
    router.push({
      name: "swap-best-offer",
      params: { id: selected },
    });
  }, 3000);
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;
}
.swap {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 16px;
    right: 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  &__wrap {
    padding: 0 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    height: calc(~"100% - 172px");
  }

  &__arrows {
    padding: 8px 0;
    text-align: center;
    font-size: 0;
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    background-color: @white;

    &-cancel {
      width: 140px;
    }

    &-send {
      width: 248px;
    }
  }
}
</style>
