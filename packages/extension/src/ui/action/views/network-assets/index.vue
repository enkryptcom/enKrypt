<template>
  <div class="container">
    <custom-scrollbar
      class="network-assets__scroll-area"
      :settings="settings"
      @ps-scroll-y="handleScroll"
    >
      <div v-if="!!selected" class="network-assets">
        <network-activity-total
          :crypto-amount="total.cryptoAmount"
          :amount="total.amount"
          :symbol="total.symbol"
        />

        <network-activity-action
          :deposit-action="depositAction"
          :buy-action="buyAction"
          :send-action="sendAction"
          :swap-action="swapAction"
        />

        <network-assets-item
          v-for="(item, index) in assets"
          :key="index"
          :token="item"
        ></network-assets-item>
      </div>
    </custom-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkAssets",
};
</script>

<script setup lang="ts">
import { useRoute } from "vue-router";
import NetworkActivityTotal from "../network-activity/components/network-activity-total.vue";
import NetworkActivityAction from "../network-activity/components/network-activity-action.vue";
import NetworkAssetsItem from "./components/network-assets-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";

import { assets } from "@action/types/mock";

const route = useRoute();

const selected: number = +route.params.id;
const total = {
  cryptoAmount: 63.466,
  amount: 3245.24,
  symbol: "dot",
};
const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

const depositAction = () => {
  console.log("depositAction");
};
const buyAction = () => {
  console.log("buyAction");
};
const sendAction = () => {
  console.log("sendAction");
};
const swapAction = () => {
  console.log("swapAction");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 488px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 56px 0;
  padding-top: 12px;
  box-sizing: border-box;
}

.network-assets {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 468px;
    margin: 0 0 8px 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
