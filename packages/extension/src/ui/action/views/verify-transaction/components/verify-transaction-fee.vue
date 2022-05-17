<template>
  <div class="verify-transaction-fee">
    <p class="verify-transaction-fee__fiat">
      Network fee: {{ $filters.currencyFormat(7.12, "USD") }}
    </p>
    <p class="verify-transaction-fee__crypto">0.0000123 <span>eth</span></p>
  </div>
</template>

<script lang="ts">
export default {
  name: "VerifyTransactionFee",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import { TransactionFee } from "@action/types/fee";

defineProps({
  fee: {
    type: Object as PropType<TransactionFee>,
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

.verify-transaction-fee {
  width: 100%;
  padding: 10px 16px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;

  &__fiat {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    margin: 0 8px 0 0;
  }

  &__crypto {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @tertiaryLabel;
    margin: 0;

    span {
      font-variant: small-caps;
    }
  }
}
</style>
