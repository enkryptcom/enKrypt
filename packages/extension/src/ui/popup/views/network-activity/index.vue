<template>
  <div class="container">
    <div v-if="!!selected" class="network-activity">
      <Total
        :crypto-amount="total.cryptoAmount"
        :amount="total.amount"
        :symbol="total.symbol"
      />

      <Action
        :deposit-action="depositAction"
        :buy-action="buyAction"
        :send-action="sendAction"
        :swap-action="swapAction"
      />

      <TransactionItem
        v-for="(item, index) in transactionsOne"
        :key="index"
        :transaction="item"
      ></TransactionItem>

      <div class="network-activity__header">July</div>

      <TransactionItem
        v-for="(item, index) in transactionsTwo"
        :key="index"
        :transaction="item"
      ></TransactionItem>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Total from "./components/total.vue";
import Action from "./components/action.vue";
import TransactionItem from "./components/transaction.vue";

import { transactionsOne, transactionsTwo } from "../../types/mock";

export default defineComponent({
  name: "NetworkActivity",
  components: {
    Total,
    Action,
    TransactionItem,
  },
  setup() {
    const route = useRoute();
    const store = useStore();

    return {
      id: computed(() => route.params.id),
      selected: computed(() => store.getters.selected),
      transactionsOne: transactionsOne,
      transactionsTwo: transactionsTwo,
      total: {
        cryptoAmount: 63.466,
        amount: 3245.24,
        symbol: "dot",
      },
      settings: {
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
    };
  },
  methods: {
    depositAction: function () {
      console.log("depositAction");
    },
    buyAction: function () {
      console.log("buyAction");
    },
    sendAction: function () {
      console.log("sendAction");
    },
    swapAction: function () {
      console.log("swapAction");
    },
  },
});
</script>

<style lang="less" scoped>
@import "../../styles/theme.less";
@import "../../styles/custom-scroll.less";

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
