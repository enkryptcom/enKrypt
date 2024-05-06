<template>
  <a class="send-fee-select" :class="{ swap: inSwap }">
    <div class="send-fee-select__value">
      <p class="send-fee-select__value-fiat">
        Fee:
        {{ fee.fiatValue ? $filters.formatFiatValue(fee.fiatValue).value : "" }}
        {{ fee.fiatSymbol ?? "" }}
      </p>
      <p class="send-fee-select__value-crypto">
        {{
          fee.nativeValue
            ? $filters.formatFloatingPointValue(fee.nativeValue).value
            : "~"
        }}
        <span>{{ fee.nativeSymbol }}</span>
      </p>
    </div>
  </a>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { GasFeeInfo } from "@/providers/ethereum/ui/types";

defineProps({
  fee: {
    type: Object as PropType<Partial<GasFeeInfo>>,
    default: () => {
      return {};
    },
  },
  inSwap: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-fee-select {
  height: 40px;
  background: #ffffff;
  margin: 0 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;

  &.swap {
    margin: 0 0 8px 0;
    width: 100%;
  }

  &__value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    &-fiat {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0 8px 0 0;
    }

    &-crypto {
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

  &__arrow {
    position: absolute;
    font-size: 0;
    right: 12px;
    top: 8px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
  }

  &__time {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    margin-right: 4px;

    span {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: @primaryLabel;
    }

    svg {
      margin-right: 4px;
    }
  }
}
</style>
