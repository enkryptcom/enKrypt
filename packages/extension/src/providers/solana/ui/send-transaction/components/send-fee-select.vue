<template>
  <a class="send-fee-select">
    <div class="send-fee-select__value">
      <p class="send-fee-select__value-fiat">
        Fee:
        {{ $filters.parseCurrency(fee.fiatValue) }}
      </p>
      <p class="send-fee-select__value-crypto">
        {{ $filters.formatFloatingPointValue(fee.nativeValue).value }}
        <span>{{ fee.nativeSymbol }}</span>
      </p>
    </div>

    <div class="send-fee-select__arrow">
      <div class="send-fee-select__time">
        <time-icon />
        <span>1 min</span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import TimeIcon from '@action/icons/fee/time-icon.vue';
import { GasFeeInfo, GasPriceTypes } from '@/providers/common/types';

defineProps({
  fee: {
    type: Object as PropType<GasFeeInfo>,
    default: () => {
      return {};
    },
  },
  selected: {
    type: String as PropType<GasPriceTypes>,
    default: GasPriceTypes.REGULAR,
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-fee-select {
  min-height: 40px;
  height: auto;
  background: #ffffff;
  margin-right: 32px;
  margin-bottom: 8px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~'100%');
  padding: 10px 16px;
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
    padding-right: 100px;

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
    top: 50%;
    margin-top: -12px;
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
