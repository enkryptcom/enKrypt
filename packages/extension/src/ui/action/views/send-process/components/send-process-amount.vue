<template>
  <div class="send-process-amount">
    <img :src="token.icon" alt="" />

    <div class="send-process-amount__info">
      <p>Amount</p>
      <h4>
        {{ fromBase(token.amount, token.decimals) }}
        <span>{{ token.symbol }}</span>
      </h4>
      <h6>{{ $filters.formatFiatValue(token.valueUSD).value }}</h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fromBase } from "@enkryptcom/utils";
import { ToTokenData } from "@/ui/action/types/token";
import { PropType } from "vue";

defineProps({
  token: {
    type: Object as PropType<ToTokenData>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-process-amount {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;

  img {
    width: 32px;
    border-radius: 100%;
    margin-right: 12px;
    height: 32px;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
  }

  &__info {
    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;

      span {
        font-variant: small-caps;
      }
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 0;
    }

    h6 {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 0;
    }
  }
}
</style>
