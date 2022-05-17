<template>
  <div class="transaction-fee" :class="{ show: showFees }">
    <div class="transaction-fee__overlay" @click="close"></div>
    <div class="transaction-fee__wrap" :class="{ show: showFees }">
      <div class="transaction-fee__info">
        <div class="transaction-fee__info-amount">
          <p class="transaction-fee__info-amount-fiat">
            {{ $filters.formatFiatValue(10.12).value }}
          </p>
          <p class="transaction-fee__info-amount-crypto">
            0.0000123 <span>eth</span>
          </p>
        </div>

        <div class="transaction-fee__info-text">
          This fee is charged by Ethereum network.
        </div>

        <div class="transaction-fee__info-time">
          <time-icon />
          <span>5 min</span>
        </div>
      </div>
      <transaction-fee-item
        v-for="(item, index) in fees"
        :key="index"
        :fee="item"
        :select-fee="selectFee"
        :selected="selected"
      ></transaction-fee-item>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "TransactionFee",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import TransactionFeeItem from "./components/transaction-fee-item.vue";
import { fees } from "@action/types/mock";
import { TransactionFee, TransactionFeeSpeed } from "@action/types/fee";
import TimeIcon from "@action/icons/fee/time-icon.vue";

const props = defineProps({
  showFees: Boolean,
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
    type: Object as PropType<TransactionFeeSpeed>,
    default: () => {
      return {};
    },
  },
});

const close = () => {
  props.close(false);
};

const selectFee = (fee: TransactionFee) => {
  props.selectFee(fee);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.transaction-fee {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 101;
  display: none;

  &.show {
    display: block;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 102;
  }

  &__wrap {
    position: absolute;
    width: 360px;
    height: auto;
    max-height: 440px;
    left: 50px;
    bottom: 100px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 103;
    padding: 16px 0 0 0;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }
  }

  &__info {
    margin-bottom: 16px;
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
}
</style>
