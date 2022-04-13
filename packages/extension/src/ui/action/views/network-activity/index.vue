<template>
  <div class="container">
    <custom-scrollbar
      class="network-activity__scroll-area"
      :settings="settings"
    >
      <div v-if="!!selected" class="network-activity">
        <network-activity-total
          :crypto-amount="props.accountInfo.activeBalances[0]"
          :amount="total.amount"
          :symbol="total.symbol"
        />

        <network-activity-action
          :deposit-action="depositAction"
          :buy-action="buyAction"
          :send-action="sendAction"
          :swap-action="swapAction"
        />

        <network-activity-transaction
          v-for="(item, index) in transactionsOne"
          :key="index"
          :transaction="item"
        />

        <div class="network-activity__header">July</div>

        <network-activity-transaction
          v-for="(item, index) in transactionsTwo"
          :key="index"
          :transaction="item"
        />
      </div>
    </custom-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkActivity",
};
</script>

<script setup lang="ts">
import { useRoute } from "vue-router";
import NetworkActivityTotal from "./components/network-activity-total.vue";
import NetworkActivityAction from "./components/network-activity-action.vue";
import NetworkActivityTransaction from "./components/network-activity-transaction.vue";
import { transactionsOne, transactionsTwo } from "@action/types/mock";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { PropType } from "vue";
import { NodeType } from "@/types/provider";
import { AccountsHeaderData } from "../../types/account";

const route = useRoute();
const props = defineProps({
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});
const selected: string = route.params.id as string;
const total = {
  cryptoAmount: props.accountInfo.activeBalances[0] || 0,
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

.network-activity {
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

  &__header {
    padding: 8px 20px 0 20px;
    font-style: normal;
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    color: @primaryLabel;
    margin: 0;
  }
}
</style>
