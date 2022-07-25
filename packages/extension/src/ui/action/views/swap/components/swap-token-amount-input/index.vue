<template>
  <div class="swap-token-input" :class="{ focus: isFocus }">
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
      :error="inputError !== null"
      @update:value="amountChanged"
    ></swap-token-amount-input>

    <a v-show="!!token" class="swap-token-input__max">Max</a>
    <div v-if="inputError !== null" class="swap-token-input__invalid">
      {{
        inputError === "MAX"
          ? `Maximum swap amount is ${
              $filters.formatFloatingPointValue(max).value
            }`
          : inputError === "MIN"
          ? `Minimum swap amount is ${
              $filters.formatFloatingPointValue(min).value
            }`
          : "Insufficient Balance"
      }}
    </div>
    <div
      v-else-if="!!token && Number(tokenAmount) > 0"
      class="swap-token-input__fiat"
    >
      ≈ ${{ $filters.formatFiatValue(tokenPrice).value }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import SwapTokenSelect from "../swap-token-select/index.vue";
import SwapTokenAmountInput from "./components/swap-token-amount-input.vue";
import { BaseToken } from "@/types/base-token";
import BigNumber from "bignumber.js";
import { fromBase } from "@/libs/utils/units";

interface IProps {
  toggleSelect: () => void;
  selectToken?: () => void;
  inputAmount: (newVal: number, isValid: boolean) => void;
  token: BaseToken | null;
  autofocus: boolean;
  min?: string;
  max?: string;
}

const props = defineProps<IProps>();

const isFocus = ref(false);
const tokenAmount = ref("");

const inputError = computed(() => {
  if (
    tokenAmount.value &&
    tokenAmount.value !== "" &&
    tokenAmount.value !== "0"
  ) {
    const fromBn = new BigNumber(tokenAmount.value);
    if (
      props.token &&
      props.token.balance &&
      fromBn.gt(fromBase(props.token.balance, props.token.decimals))
    ) {
      return "INSUFFICIENT";
    } else if (props.max && fromBn.gt(props.max)) {
      return "MAX";
    } else if (props.min && fromBn.lt(props.min)) {
      return "MIN";
    }
  }

  return null;
});

const tokenPrice = computed(() => {
  if (props.token?.price && tokenAmount.value !== "") {
    return new BigNumber(tokenAmount.value)
      .times(new BigNumber(props.token.price))
      .toFixed();
  }

  return null;
});

const amountChanged = (newVal: string) => {
  tokenAmount.value = newVal;
  props.inputAmount(Number(newVal), inputError.value !== null);
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

  &__invalid {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0.25px;
    color: @error;
    position: absolute;
    left: 16px;
    bottom: 16px;
  }
}
</style>
