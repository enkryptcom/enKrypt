<template>
  <div class="verify-transaction-fee">
    <p class="verify-transaction-fee__fiat">
      Network fee: ${{ $filters.formatFiatValue(fee.fiatValue).value }}
    </p>
    <p class="verify-transaction-fee__crypto">
      {{ $filters.formatFloatingPointValue(fee.nativeValue).value }}
      <span>{{ fee.nativeSymbol }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { GasFeeInfo } from "@/providers/common/types";

defineProps({
  fee: {
    type: Object as PropType<GasFeeInfo>,
    default: () => {
      return {};
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
