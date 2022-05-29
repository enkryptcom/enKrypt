<template>
  <a class="send-fee-select" :class="{ swap: inSwap }" @click="open">
    <div class="send-fee-select__value">
      <p class="send-fee-select__value-fiat">
        Fee: {{ $filters.formatFiatValue(balance).value }}
      </p>
      <p class="send-fee-select__value-crypto">
        {{ balance }} <span>eth</span>
      </p>
    </div>

    <div class="send-fee-select__arrow">
      <div class="send-fee-select__time">
        <time-icon />
        <span>5 min</span>
      </div>
      <switch-arrow />
    </div>
  </a>
</template>

<script lang="ts">
export default {
  name: "SendFeeSelect",
};
</script>

<script setup lang="ts">
import { ref, PropType, computed } from "vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { TransactionFee } from "@action/types/fee";
import TimeIcon from "@action/icons/fee/time-icon.vue";
import { fromWei } from "web3-utils";

let isOpen = ref(false);

const props = defineProps({
  toggleSelect: {
    type: Function,
    default: () => {
      return null;
    },
  },
  fee: {
    type: Object as PropType<TransactionFee>,
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

const open = () => {
  isOpen.value = !isOpen.value;
  props.toggleSelect(isOpen);
};

const balance = computed(() => {
  return fromWei(props.fee.price.totalFee.toString());
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
