<template>
  <div class="swap-token-input" :class="{ focus: isFocus }">
    <swap-token-select v-bind="$attrs" :token="token" />

    <swap-token-amount-input
      v-show="!!token"
      :value="amount"
      :is-finding-rate="isFindingRate"
      :no-providers="noProviders"
    />

    <swap-token-fast-list
      v-show="!token"
      :fast-list="fastList"
      :total-tokens="totalTokens"
      v-bind="$attrs"
    />

    <div v-show="!!token && Number(amount) > 0" class="swap-token-input__fiat">
      ≈ ${{ tokenPrice ? $filters.formatFiatValue(tokenPrice).value : "~" }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SwapTokenToAmount",
};
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import SwapTokenSelect from "../swap-token-select/index.vue";
import SwapTokenFastList from "../swap-token-fast-list/index.vue";
import SwapTokenAmountInput from "./components/swap-token-amount-input.vue";
import { PropType } from "vue";
import { SwapToken, TokenTypeTo } from "@enkryptcom/swap";

const props = defineProps({
  token: {
    type: Object as PropType<TokenTypeTo | null>,
    default: () => {
      return null;
    },
  },
  amount: {
    type: String,
    default: () => "",
  },
  isFindingRate: {
    type: Boolean,
    default: () => false,
  },
  fastList: {
    type: Object as PropType<TokenTypeTo[]>,
    default: () => null,
  },
  totalTokens: {
    type: Number,
    default: () => null,
  },
  noProviders: Boolean,
});

const isFocus = ref(false);

const tokenPrice = computed(() => {
  if (props.token?.price && props.amount) {
    return new SwapToken(props.token).getReadableToFiat(props.amount);
  }
  return 0;
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.swap-token-input {
  width: 100%;
  min-height: 136px;
  border: 1px solid rgba(95, 99, 104, 0.2);
  box-sizing: border-box;
  border-radius: 10px;
  position: relative;

  &.focus {
    border: 1px solid @primary;
  }

  &__max {
    padding: 4px 8px;
    text-decoration: none;
    position: absolute;
    width: 41px;
    height: 24px;
    right: 18px;
    bottom: 30px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 6px;
    cursor: pointer;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.8px;
    box-sizing: border-box;
    color: @primaryLabel;
  }

  &__fiat {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    position: absolute;
    left: 16px;
    bottom: 16px;
  }
}
</style>
