<template>
  <div class="send-alert">
    <alert-icon />
    <p v-if="isBalanceZero">Not enough balance.</p>
    <p v-else-if="belowDust">Minimum amount: {{ dust }}</p>
    <p v-else-if="notEnough">
      Not enough funds. You are<br />
      ~{{ shortAmount }} {{ nativeSymbol }} ({{ shortAmountUSD }}) short.
    </p>
  </div>
</template>

<script setup lang="ts">
import AlertIcon from '@action/icons/send/alert-icon.vue';
import BigNumber from 'bignumber.js';
import { computed, inject } from 'vue';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';

interface IProps {
  nativeSymbol: string;
  nativeValue: string;
  price: string;
  notEnough: boolean;
  belowDust: boolean;
  isBalanceZero: boolean;
  dust: string;
}

const props = withDefaults(defineProps<IProps>(), {
  price: '0',
});

const $filters = inject('$filters', null) as any;

const priceDifference = computed(() => {
  return new BigNumber(props.nativeValue).times(props.price).toFixed();
});

const shortAmount = computed(() => {
  return formatFloatingPointValue(props.nativeValue).value;
});

const shortAmountUSD = computed(() => {
  if ($filters?.parseCurrency) {
    return $filters.parseCurrency(priceDifference.value);
  }
  const value = parseFloat(priceDifference.value);
  return isNaN(value) ? '$0.00' : `$${value.toFixed(2)}`;
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-alert {
  margin: 0 32px 8px 32px;
  background: @error01;
  border-radius: 10px;
  padding: 12px 16px 12px 57px;
  position: relative;
  box-sizing: border-box;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    margin-top: -12px;
  }

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0;
  }
}
</style>
