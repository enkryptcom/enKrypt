<template>
  <div class="swap-token-input" :class="{ focus: isFocus }">
    <swap-token-select v-bind="$attrs" :token="token" />

    <swap-token-amount-input
      v-show="!!token"
      placeholder="Enter amount"
      v-bind="$attrs"
      :value="value"
      :autofocus="autofocus"
      :change-focus="changeFocus"
      :error="!!errorMessage"
    />

    <a
      v-show="!!token && token.address !== NATIVE_TOKEN_ADDRESS"
      class="swap-token-input__max"
      @click="$emit('update:inputMax')"
      >Max</a
    >
    <div v-if="errorMessage" class="swap-token-input__invalid">
      {{ errorMessage }}
    </div>
    <div
      v-else-if="!!token && Number(value) > 0"
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
import { NATIVE_TOKEN_ADDRESS } from "@/providers/ethereum/libs/common";
import { TokenType, SwapToken } from "@enkryptcom/swap";

defineEmits<{
  (e: "update:inputMax"): void;
}>();

interface IProps {
  value: string;
  token: TokenType;
  autofocus: boolean;
  errorMessage?: string;
}

const props = defineProps<IProps>();

const isFocus = ref(false);

const tokenPrice = computed(() => {
  if (props.value !== "") {
    const Token = new SwapToken(props.token);
    return Token.getReadableToFiat(props.value);
  }
  return 0;
});

const changeFocus = (newVal: boolean) => {
  isFocus.value = newVal;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.swap-token-input {
  width: 100%;
  min-height: 125px;
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
    bottom: 6px;
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
    bottom: 6px;
  }
}
</style>
