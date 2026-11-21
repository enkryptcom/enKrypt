<template>
  <common-send-alert>
    <p v-if="isBalanceZero">Not enough balance.</p>
    <p v-else-if="belowDust">Minimum amount: {{ dust }}</p>
    <p v-else-if="notEnough">
      Not enough funds. You are<br />~{{
        $filters.formatFloatingPointValue(nativeValue).value
      }}
      {{ nativeSymbol }} ({{ $filters.parseCurrency(priceDifference) }}) short.
    </p>
  </common-send-alert>
</template>

<script setup lang="ts">
import CommonSendAlert from '@/ui/send/send-alert.vue';
import BigNumber from 'bignumber.js';
import { computed } from 'vue';

interface IProps {
  nativeSymbol: string;
  nativeValue: string;
  price?: string;
  notEnough: boolean;
  belowDust: boolean;
  isBalanceZero: boolean;
  dust: string;
}

const props = defineProps<IProps>();

const priceDifference = computed(() => {
  return new BigNumber(props.nativeValue).times(props.price ?? '0').toFixed();
});
</script>
