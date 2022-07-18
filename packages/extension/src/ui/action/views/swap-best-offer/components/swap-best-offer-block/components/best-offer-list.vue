<template>
  <div>
    <div class="best-offer-list">
      <best-offer-list-item
        v-for="quote in quotes"
        :key="quote.exchange"
        :name="quote.exchange"
        :amount="`~${quote.amount}`"
        :select="() => select(quote)"
        :is-checked="quote.exchange === pickedQuote.exchange"
        :is-loading="false"
      ></best-offer-list-item>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BestOfferList",
};
</script>

<script setup lang="ts">
import { QuoteInfo } from "@/providers/swap/types/SwapProvider";
import BestOfferListItem from "./best-offer-list-item.vue";

interface IProps {
  quotes: QuoteInfo[];
  pickedQuote: QuoteInfo;
  select: (quote: QuoteInfo) => void;
}

const props = defineProps<IProps>();

const select = (quote: QuoteInfo) => {
  props.select(quote);
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
