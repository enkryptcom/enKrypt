<template>
  <div class="verify-transaction-amount">
    <img :src="token.icon" alt="" />

    <div class="verify-transaction-amount__info">
      <p>Amount</p>
      <h4>
        {{ amount }} <span>{{ token.symbol }}</span>
      </h4>
      <h6>{{ $filters.currencyFormat(amount * token.price, "USD") }}</h6>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "VerifyTransactionAmount",
};
</script>

<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { Token } from "@action/types/token";

defineProps({
  token: {
    type: Object as PropType<Token>,
    default: () => {
      return {};
    },
  },
  amount: {
    type: Number,
    default: () => {
      return 0;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.verify-transaction-amount {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid @gray02;

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
