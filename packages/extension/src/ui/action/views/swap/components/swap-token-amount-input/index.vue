<template>
  <div class="swap-token-input" :class="{ focus: isFocus }">
    <div class="swap-token-input__row">
      <swap-token-amount-input
        placeholder="0.0"
        v-bind="$attrs"
        :value="value"
        :autofocus="autofocus"
        :change-focus="changeFocus"
        :error="!!errorMessage"
      />
      <swap-token-select v-bind="$attrs" :token="token" />
    </div>
<<<<<<< HEAD
    <div class="swap-token-input__row">
      <div v-if="errorMessage" class="swap-token-input__invalid">
        {{ errorMessage }}
      </div>
      <div
        v-else-if="!!token"
        class="swap-token-input__secondary-label swap-token-input__secondary-label__fiat"
      >
        ~{{
          $filters.parseCurrency($filters.formatFiatValue(tokenPrice).value)
        }}
      </div>
      <div
        class="swap-token-input__secondary-label swap-token-input__secondary-label__balance"
        :class="{ focus: isFocus }"
      >
        Balance:
        {{ $filters.formatFloatingPointValue(tokenBalance).value }}
      </div>
=======
    <div
      v-else-if="!!token && Number(value) > 0"
      class="swap-token-input__fiat"
    >
      ≈ {{ $filters.parseCurrency(tokenPrice) }}
>>>>>>> develop
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SwapTokenSelect from '../swap-token-select/index.vue';
import SwapTokenAmountInput from './components/swap-token-amount-input.vue';
import { NATIVE_TOKEN_ADDRESS } from '@/providers/ethereum/libs/common';
import { TokenType, SwapToken } from '@enkryptcom/swap';

defineEmits<{
  (e: 'update:inputMax'): void;
}>();

interface IProps {
  value: string;
  token: TokenType | null;
  autofocus: boolean;
  errorMessage?: string;
}

const props = defineProps<IProps>();

const isFocus = ref(false);

const tokenPrice = computed(() => {
  if (props.value !== '' && props.token) {
    const Token = new SwapToken(props.token);
    return Token.getReadableToFiat(props.value);
  }
  return 0;
});

const tokenBalance = computed(() => {
  if (!props.token) {
    return 0;
  }
  return new SwapToken(props.token).getBalanceReadable();
});

const changeFocus = (newVal: boolean) => {
  isFocus.value = newVal;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.swap-token-input {
  width: 100%;
  height: 100px;
  border: 1px solid @grey08;
  box-sizing: border-box;
  border-radius: 10px;
  position: relative;
  background-color: @white;
  padding: 16px;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &.focus {
    border: 1px solid @primary;
  }

  &__secondary-label {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    padding-top: 8px;
    padding-left: 2px;
    &__fiat {
      color: @black06;
    }
    &__balance {
      color: @black06;
      margin-left: auto;
      .focus {
        color: @primaryDarker;
      }
    }
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
