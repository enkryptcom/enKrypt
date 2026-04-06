<template>
  <div class="send-process-amount">
    <img :src="token.icon" alt="" />

    <div class="send-process-amount__info">
      <p>Amount</p>
      <h4>
        {{ fromBase(token.amount, token.decimals) }}
        <span>{{ token.symbol.toUpperCase() }}</span>
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

.send-process-amount {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 14px 16px;
  box-sizing: border-box;
  background: @white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);

  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    object-fit: cover;
  }

  &__info {
    flex: 1;
    min-width: 0;

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 14px;
      color: @tertiaryLabel;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h4 {
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;

      span {
        font-weight: 500;
        font-size: 13px;
        color: @secondaryLabel;
        margin-left: 4px;
      }
    }

    h6 {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 2px 0 0 0;
    }
  }
}
</style>
