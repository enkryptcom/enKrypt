<template>
  <a class="transaction-fee-item" @click="select">
    <div
      class="transaction-fee-item__block"
      :class="{ active: selected == type }"
    >
      <economy-icon v-show="type == GasPriceTypes.ECONOMY" />
      <recomended-icon v-show="type == GasPriceTypes.REGULAR" />
      <higher-icon v-show="type == GasPriceTypes.FAST" />
      <highest-icon v-show="type == GasPriceTypes.FASTEST" />

      <div class="transaction-fee-item__block-info">
        <h4>{{ FeeDescriptions[type].title }}</h4>
        <p>{{ FeeDescriptions[type].description }}</p>
      </div>

      <div
        class="transaction-fee-item__block-amount"
        :class="{ down: parseFloat(diff) < 0 }"
      >
        {{ parseFloat(diff) < 0 ? "-" : "+" }}${{ Math.abs(parseFloat(diff)) }}
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";
import EconomyIcon from "@action/icons/fee/economy-icon.vue";
import RecomendedIcon from "@action/icons/fee/recomended-icon.vue";
import HigherIcon from "@action/icons/fee/higher-icon.vue";
import HighestIcon from "@action/icons/fee/highest-icon.vue";
import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import { FeeDescriptions } from "@/providers/ethereum/libs/transaction/gas-utils";
import BigNumber from "bignumber.js";

const emit = defineEmits<{
  (e: "gasTypeChanged", type: GasPriceTypes): void;
}>();
const props = defineProps({
  allFees: {
    type: Object as PropType<GasFeeType>,
    default: () => ({}),
  },
  type: {
    type: String as PropType<GasPriceTypes>,
    default: GasPriceTypes.ECONOMY,
  },
  selected: {
    type: String as PropType<GasPriceTypes>,
    default: GasPriceTypes.ECONOMY,
  },
});
const diff = computed(() => {
  if (props.allFees[props.selected]) {
    const selectedVal = props.allFees[props.selected];
    const curVal = props.allFees[props.type];
    return new BigNumber(curVal.fiatValue)
      .minus(selectedVal.fiatValue)
      .toFixed(4);
  } else {
    return "0";
  }
});
const select = () => {
  emit("gasTypeChanged", props.type);
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
  position: relative;

  &__block {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    height: 80px;
    border-radius: 8px;
    width: 100%;
    transition: background 300ms ease-in-out;

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

    &-amount {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      text-align: right;
      color: @success;
      position: absolute;
      right: 20px;
      top: 16px;

      &.down {
        color: @secondaryLabel;
      }
    }

    &.active {
      background-color: @black007;

      .transaction-fee-item__block-amount {
        display: none;
      }
    }

    &:hover {
      background-color: @black007;
    }
  }
}
</style>
