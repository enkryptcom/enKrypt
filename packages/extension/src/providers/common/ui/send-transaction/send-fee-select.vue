<template>
  <a
    class="send-fee-select"
    :class="{ swap: inSwap }"
    @click="emit('openPopup')"
  >
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
        <span>{{ FeeDescriptions[selected].eta }}</span>
      </div>
      <switch-arrow />
    </div>
  </a>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import TimeIcon from '@action/icons/fee/time-icon.vue';
import { GasFeeInfo, GasPriceTypes } from '@/providers/common/types';
import { FeeDescriptions } from '@/providers/ethereum/libs/transaction/gas-utils';

const emit = defineEmits<{
  (e: 'openPopup'): void;
}>();

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
  inSwap: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-fee-select {
  min-height: 48px;
  height: auto;
  background: @white;
  margin: 4px 24px 8px 24px;
  box-sizing: border-box;
  border: 1.5px solid rgba(98, 126, 234, 0.15);
  border-radius: 14px;
  width: calc(~'100% - 48px');
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  transition: all 200ms ease-in-out;
  box-shadow: 0 2px 8px rgba(98, 126, 234, 0.06);

  &:hover {
    border-color: rgba(98, 126, 234, 0.25);
    background: rgba(98, 126, 234, 0.02);
    box-shadow: 0 2px 8px rgba(98, 126, 234, 0.08);
  }

  &.swap {
    margin: 0 0 8px 0;
    width: 100%;
  }

  &__value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;

    &-fiat {
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.1px;
      color: @primaryLabel;
      margin: 0;
    }

    &-crypto {
      font-style: normal;
      font-weight: 400;
      font-size: 13px;
      line-height: 18px;
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

  &__arrow {
    font-size: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-direction: row;
    gap: 4px;
    padding: 4px 4px 4px 8px;
    border-radius: 8px;
    transition: background 150ms ease-in-out;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &__time {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 4px 8px;
    background: rgba(34, 197, 94, 0.1);
    border-radius: 8px;
    gap: 4px;

    span {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      color: #16a34a;
    }

    svg {
      color: #16a34a;
    }
  }
}
</style>
