<template>
  <div class="swap-token-input" :class="{ focus: isFocus }">
    <swap-token-select v-bind="$attrs" :token="token" />

    <swap-token-amount-input
      v-show="!!token"
      placeholder="Enter amount"
      :value="tokenAmount.toString()"
      :autofocus="autofocus"
      :change-focus="changeFocus"
      :error="currentInputError !== null"
      @update:value="amountChanged"
    />

    <a
      v-show="!!token && ((token as any).contract !== NATIVE_TOKEN_ADDRESS)"
      class="swap-token-input__max"
      @click="inputMax"
      >Max</a
    >
    <div v-if="currentInputError !== null" class="swap-token-input__invalid">
      {{
        currentInputError === "MAX"
          ? `Maximum swap amount is ${
              $filters.formatFloatingPointValue(max).value
            }`
          : currentInputError === "MIN"
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
import { NATIVE_TOKEN_ADDRESS } from "@/providers/ethereum/libs/common";

const emit = defineEmits<{
  (e: "update:inputMax"): void;
  (e: "input:changed", amount: string, isInvalid: boolean): void;
}>();

interface IProps {
  tokenAmount: string;
  token: BaseToken | null;
  autofocus: boolean;
  min?: string;
  max?: string;
}

const props = defineProps<IProps>();

const isFocus = ref(false);

const currentInputError = computed(() => {
  return inputError(props.tokenAmount.toString());
});
const inputError = (value: string) => {
  if (value && value !== "" && Number(value) !== 0) {
    const fromBn = new BigNumber(value);
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
};

const tokenPrice = computed(() => {
  if (props.token?.price && props.tokenAmount !== "") {
    return new BigNumber(props.tokenAmount)
      .times(new BigNumber(props.token.price))
      .toFixed();
  }
  return null;
});

const amountChanged = (newVal: string) => {
  emit("input:changed", newVal, inputError(newVal) !== null);
};

const changeFocus = (newVal: boolean) => {
  isFocus.value = newVal;
};

const inputMax = () => {
  if (props.token && props.token.balance) {
    const tokenBalance = fromBase(props.token.balance, props.token.decimals);
    amountChanged(tokenBalance);
  }
  emit("update:inputMax");
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
