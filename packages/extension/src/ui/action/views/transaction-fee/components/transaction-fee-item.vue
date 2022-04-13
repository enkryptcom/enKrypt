<template>
  <a class="transaction-fee-item" @click="select">
    <div
      class="transaction-fee-item__block"
      :class="{ active: selected == fee.price.speed }"
    >
      <economy-icon v-show="fee.price.speed == TransactionFeeSpeed.economy" />
      <recomended-icon
        v-show="fee.price.speed == TransactionFeeSpeed.recommended"
      />
      <higher-icon
        v-show="fee.price.speed == TransactionFeeSpeed.higherPriority"
      />
      <highest-icon
        v-show="fee.price.speed == TransactionFeeSpeed.highestPriority"
      />

      <div class="transaction-fee-item__block-info">
        <h4>{{ fee.price.title }}</h4>
        <p>{{ fee.price.description }}</p>
      </div>

      <div class="transaction-fee-item__block-amount"></div>
    </div>
  </a>
</template>

<script lang="ts">
export default {
  name: "TransactionFeeItem",
};
</script>

<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { TransactionFee, TransactionFeeSpeed } from "@action/types/fee";
import EconomyIcon from "@action/icons/fee/economy-icon.vue";
import RecomendedIcon from "@action/icons/fee/recomended-icon.vue";
import HigherIcon from "@action/icons/fee/higher-icon.vue";
import HighestIcon from "@action/icons/fee/highest-icon.vue";

const props = defineProps({
  fee: {
    type: Object as PropType<TransactionFee>,
    default: () => {
      return {};
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

const select = () => {
  props.selectFee(props.fee);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.transaction-fee-item {
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 88px;
  cursor: pointer;
  text-decoration: none;
  padding: 4px 8px;
  box-sizing: border-box;

  &__block {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    height: 80px;
    border-radius: 8px;
    width: 100%;

    &.active {
      background-color: @primary01;
    }

    svg {
      width: 24px;
      height: 24px;
      margin-right: 16px;
      margin-left: 12px;
    }

    &-info {
      width: 197px;

      h4 {
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: @primaryLabel;
        margin: 0;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        color: @secondaryLabel;
        margin: 0;
      }
    }
  }
}
</style>
