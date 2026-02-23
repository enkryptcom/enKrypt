<template>
  <div class="verify-transaction-amount">
    <img :src="token.icon" alt="" />

    <div class="verify-transaction-amount__info">
      <p>Amount</p>
      <h4>
        {{ fromBase(token.amount, token.decimals) }}
        <span>{{ token.symbol }}</span>
      </h4>
      <h6>{{ $filters.parseCurrency(token.valueUSD) }}</h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fromBase } from '@enkryptcom/utils';
import { ToTokenData } from '@/ui/action/types/token';
import { PropType } from 'vue';

defineProps({
  token: {
    type: Object as PropType<ToTokenData>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.verify-transaction-amount {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 14px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(34, 197, 94, 0.03);

  img {
    width: 36px;
    border-radius: 10px;
    margin-right: 12px;
    height: 36px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &__info {
    h4 {
      font-style: normal;
      font-weight: 700;
      font-size: 16px;
      line-height: 22px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;

      span {
        font-variant: small-caps;
        font-weight: 500;
        color: @secondaryLabel;
      }
    }

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: @secondaryLabel;
      margin: 0 0 2px 0;
    }

    h6 {
      font-style: normal;
      font-weight: 500;
      font-size: 13px;
      line-height: 18px;
      color: #16a34a;
      margin: 2px 0 0 0;
    }
  }
}
</style>
