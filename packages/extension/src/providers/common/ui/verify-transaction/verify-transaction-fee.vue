<template>
  <div class="verify-transaction-fee">
    <p class="verify-transaction-fee__fiat">
      Network fee:
      {{ $filters.parseCurrency(fee.fiatValue) }}
    </p>
    <p class="verify-transaction-fee__crypto">
      {{ $filters.formatFloatingPointValue(fee.nativeValue).value }}
      <span>{{ fee.nativeSymbol }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { GasFeeInfo } from '@/providers/common/types';

defineProps({
  fee: {
    type: Object as PropType<GasFeeInfo>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.verify-transaction-fee {
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  background: rgba(0, 0, 0, 0.01);

  &__fiat {
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 18px;
    letter-spacing: 0.1px;
    color: @primaryLabel;
    margin: 0;
  }

  &__crypto {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.2px;
    color: @secondaryLabel;
    margin: 0;
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 6px;

    span {
      font-variant: small-caps;
      font-weight: 500;
    }
  }
}
</style>
