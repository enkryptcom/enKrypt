<template>
  <div class="swap-token-input" :class="{ focus: isFocus, empty: !token }">
    <swap-token-select
      :toggle-select="toggleSelect"
      :token="token"
    ></swap-token-select>

    <swap-token-amount-input
      v-show="!!token"
      placeholder="Enter amount"
      :value="tokenAmount"
      :autofocus="autofocus"
      :change-focus="changeFocus"
      @update:value="amountChanged"
    ></swap-token-amount-input>

    <swap-token-fast-list
      v-show="!token"
      :select-token="selectToken"
    ></swap-token-fast-list>

    <a v-show="!!token" class="swap-token-input__max">Max</a>
    <div
      v-show="!!token && Number(tokenAmount) > 0"
      class="swap-token-input__fiat"
    >
      ≈ ${{
        $filters.formatFiatValue(Number(tokenAmount) * token?.decimals).value
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SwapTokenSelect from "../swap-token-select/index.vue";
import SwapTokenFastList from "../swap-token-fast-list/index.vue";
import SwapTokenAmountInput from "./components/swap-token-amount-input.vue";
import { PropType } from "vue";
import { AssetsType } from "@/types/provider";

const isFocus = ref(false);
const tokenAmount = ref("");

const props = defineProps({
  toggleSelect: {
    type: Function,
    default: () => {
      return null;
    },
  },
  selectToken: {
    type: Function,
    default: () => {
      return null;
    },
  },
  inputAmount: {
    type: Function,
    default: () => {
      return null;
    },
  },
  token: {
    type: Object as PropType<AssetsType | null>,
    default: () => {
      return null;
    },
  },
  autofocus: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

const amountChanged = (newVal: string) => {
  tokenAmount.value = newVal;
  props.inputAmount(Number(newVal));
};

const changeFocus = (newVal: boolean) => {
  isFocus.value = newVal;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.swap-token-input {
  width: 100%;
  min-height: 148px;
  border: 1px solid rgba(95, 99, 104, 0.2);
  box-sizing: border-box;
  border-radius: 10px;
  position: relative;

  &.empty {
    border: 0 none;
  }

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
