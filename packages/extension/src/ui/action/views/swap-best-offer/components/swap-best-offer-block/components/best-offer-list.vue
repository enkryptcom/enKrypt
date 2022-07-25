<template>
  <div>
    <div class="best-offer-list">
      <best-offer-list-item
        v-for="trade in trades"
        :key="trade.provider"
        :name="trade.provider"
        :amount="`~${trade.minimumReceived}`"
        :select="() => select(trade)"
        :is-checked="trade.provider === pickedTrade.provider"
        :is-loading="false"
      ></best-offer-list-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuoteInfo, TradeInfo } from "@/providers/swap/types/SwapProvider";
import BestOfferListItem from "./best-offer-list-item.vue";

interface IProps {
  trades: TradeInfo[];
  pickedTrade: TradeInfo;
  select: (trade: TradeInfo) => void;
}

const props = defineProps<IProps>();

const select = (trade: TradeInfo) => {
  props.select(trade);
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.best-offer-list {
  background: #ffffff;
  box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
    0px 3.75px 11px rgba(0, 0, 0, 0.19);
  border-radius: 12px;
  box-sizing: border-box;
  width: 256px;
  padding: 4px;
  position: absolute;
  left: -6px;
  top: 37px;
  z-index: 10;
}
</style>
