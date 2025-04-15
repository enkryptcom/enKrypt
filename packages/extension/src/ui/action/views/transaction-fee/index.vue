<template>
  <component
    :is="isPopup ? 'div' : AppDialog"
    v-model="model"
    @close:dialog="closepopup"
    :is-centered="isPopup"
  >
    <div :class="[{ popup: isPopup }, { show: isPopup && model }]">
      <div
        class="transaction-fee__wrap"
        :class="[
          { header: isHeader, 'transaction-fee__as-popup': isPopup },
          { show: isPopup && model },
        ]"
      >
        <div v-if="isHeader" class="transaction-fee__header">
          <h3>Choose transaction fee</h3>
          <a v-if="isPopup" class="transaction-fee__close" @click="closepopup">
            <close-icon />
          </a>
        </div>

        <div class="transaction-fee__info">
          <div class="transaction-fee__info-amount">
            <p class="transaction-fee__info-amount-fiat">
              {{ $filters.parseCurrency(fees[selected].fiatValue) }}
            </p>
            <p class="transaction-fee__info-amount-crypto">
              {{
                $filters.formatFloatingPointValue(fees[selected].nativeValue)
                  .value
              }}
              <span>{{ fees[selected].nativeSymbol }}</span>
            </p>
          </div>

          <div class="transaction-fee__info-text">
            This fee is charged by the network.
          </div>

          <div class="transaction-fee__info-time">
            <time-icon />
            <span>{{ FeeDescriptions[selected].eta }}</span>
          </div>
        </div>
        <transaction-fee-item
          v-for="(value, type) in fees"
          :key="type"
          :all-fees="fees"
          :selected="selected"
          :type="type"
          v-bind="$attrs"
          @gasTypeChanged="$emit('gasTypeChanged', type)"
        />
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import TransactionFeeItem from './components/transaction-fee-item.vue';
import TimeIcon from '@action/icons/fee/time-icon.vue';
import CloseIcon from '@action/icons/common/close-icon.vue';
import AppDialog from '@action/components/app-dialog/index.vue';
import { GasFeeType, GasPriceTypes } from '@/providers/common/types';
import { FeeDescriptions } from '@/providers/ethereum/libs/transaction/gas-utils';
const emit = defineEmits<{
  (e: 'closePopup'): void;
  (e: 'gasTypeChanged', type: GasPriceTypes): void;
}>();

const props = defineProps({
  fees: {
    type: Object as PropType<GasFeeType>,
    default: () => ({}),
  },
  isHeader: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isPopup: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  close: {
    type: Function,
    default: () => {
      return null;
    },
  },
  selectFee: {
    type: Function,
    default: () => {
      return null;
    },
  },
  selected: {
    type: String as PropType<GasPriceTypes>,
    default: GasPriceTypes.ECONOMY,
  },
});
const model = defineModel<boolean>();

const closepopup = () => {
  emit('closePopup');
  if (props.isPopup) {
    model.value = false;
  }
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.popup {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 101;
  display: none;
  align-items: center;
  flex-direction: row;
  padding: 16px;
  background: rgba(0, 0, 0, 0.32);

  &.show {
    display: block;
  }
}

.transaction-fee {
  width: 100%;
  height: 100%;

  &__as-popup {
    width: 428px;
    height: auto;
    max-height: 440px;
    left: 16px;
    bottom: 100px;
    background: #ffffff;
    box-shadow:
      0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 109;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s,
      visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }
  }

  &__wrap {
    max-height: 440px;
    padding: 16px 0 0 0;
    box-sizing: border-box;
    overflow: hidden;

    &.header {
      padding: 0;
      max-height: 512px;
      bottom: 52px;
    }
  }

  &__info {
    margin-bottom: 12px;
    padding: 0 20px;
    position: relative;

    &-amount {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;

      &-fiat {
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 28px;
        letter-spacing: 0.15px;
        color: @primaryLabel;
        margin: 0;
        margin-right: 8px;
      }

      &-crypto {
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: @secondaryLabel;
        margin: 0;

        span {
          font-variant: small-caps;
        }
      }
    }

    &-text {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: @secondaryLabel;
      margin: 0;
    }

    &-time {
      position: absolute;
      right: 20px;
      top: 4px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;

      span {
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: @primaryLabel;
      }

      svg {
        margin-right: 4px;
      }
    }
  }

  &__header {
    width: 100%;
    background: @white;
    box-sizing: border-box;
    padding: 14px 16px;
    position: relative;
    z-index: 4;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 32px;
      margin: 0;
      color: @primaryLabel;
    }
  }

  &__close {
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;
    z-index: 106;

    &:hover {
      background: @black007;
    }
  }
}
</style>
