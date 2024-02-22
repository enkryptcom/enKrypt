<template>
  <div class="send-input-amount" :class="{ focus: isFocus }">
    <input
      v-model="amount"
      type="number"
      placeholder="0"
      :class="{ error: !isValid }"
      @focus="changeFocus"
      @blur="changeFocus"
      @input="emit('update:inputSetMax', false)"
    />

    <div class="send-input-amount__fiat">
      <switch-arrow-icon />
      <span>${{ $filters.formatFiatValue(fiatEquivalent).value }}</span>
    </div>

    <a class="send-input-amount__max" @click="emit('update:inputSetMax', true)">
      Max
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import SwitchArrowIcon from "@action/icons/send/switch-arrow-icon.vue";
import BigNumber from "bignumber.js";

const emit = defineEmits<{
  (e: "update:inputAmount", address: string | undefined): void;
  (e: "update:inputSetMax", max: boolean): void;
}>();

const isFocus = ref(false);

const props = defineProps({
  isValid: {
    type: Boolean,
    default: false,
  },
  fiatValue: {
    type: String,
    default: "1",
  },
  amount: {
    type: String,
    default: "",
  },
});
const fiatEquivalent = computed(() => {
  return new BigNumber(props.fiatValue).times(props.amount).toString();
});
const amount = computed({
  get: () => props.amount,
  set: (value) => {
    emit(
      "update:inputAmount",
      value ? new BigNumber(value).toFixed() : value.toString()
    );
  },
});

const changeFocus = () => {
  isFocus.value = !isFocus.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-input-amount {
  height: 100px;
  background: #ffffff;
  margin: 0 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: row;
  position: relative;

  &.focus {
    border: 1px solid @primary;
  }

  input {
    width: 290px;
    height: 40px;
    font-style: normal;
    font-weight: 400;
    font-size: 34px;
    line-height: 40px;
    text-align: left;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
    padding: 0;
    caret-color: @primary;
  }
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }

  &__fiat {
    position: absolute;
    left: 16px;
    bottom: 16px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    svg {
      margin-right: 4px;
    }

    span {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      letter-spacing: 0.25px;
      color: @tertiaryLabel;
    }
  }

  &__max {
    position: absolute;
    width: 43px;
    height: 24px;
    right: 16px;
    top: 50%;
    margin-top: -12px;
    background: @buttonBg;
    border-radius: 6px;
    font-style: normal;
    font-weight: 500;
    font-size: 11px;
    line-height: 24px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: @primaryLabel;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    display: block;

    &:active {
      opacity: 0.7;
    }
  }

  .error {
    color: @error !important;
  }
}
</style>
