<template>
  <div class="container">
    <div v-if="!!selected" class="network-assets">
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

      <Item v-for="(item, index) in assets" :key="index" :token="item"></Item>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Total from "../network-activity/components/total.vue";
import Action from "../network-activity/components/action.vue";
import Item from "./components/asset.vue";

import { assets } from "../../types/mock";

export default defineComponent({
  name: "NetworkAssets",
  components: {
    Total,
    Action,
    Item,
  },
  setup() {
    const route = useRoute();
    const store = useStore();

    return {
      id: computed(() => route.params.id),
      selected: computed(() => store.getters.selected),
      total: {
        cryptoAmount: 63.466,
        amount: 3245.24,
        symbol: "dot",
      },
      assets: assets,
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
