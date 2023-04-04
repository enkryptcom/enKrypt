<template>
  <div
    :class="`swap-token-amount-input ${
      value === '' || isFindingRate ? 'placeholder' : ''
    }`"
  >
    {{
      !isFindingRate
        ? `${
            value
              ? "≈ " + $filters.formatFloatingPointValue(value).value
              : noProviders
              ? "No Providers"
              : "Waiting"
          }`
        : "Getting rate"
    }}
  </div>
</template>

<script lang="ts">
export default {
  name: "SwapTokenAmountInput",
};
</script>

<script setup lang="ts">
defineProps({
  placeholder: {
    type: String,
    default: () => {
      return "";
    },
  },
  value: {
    type: String,
    default: () => {
      return "";
    },
  },
  changeFocus: {
    type: Function,
    default: () => {
      return null;
    },
  },
  autofocus: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isFindingRate: {
    type: Boolean,
    default: () => false,
  },
  noProviders: Boolean,
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";
.swap-token-amount-input {
  outline: none;
  background: @white;
  margin: 0;
  padding: 0 76px 0 16px;
  font-style: normal;
  font-weight: 400;
  font-size: 34px;
  line-height: 40px;
  letter-spacing: 0.25px;
  color: @primaryLabel;
  width: 100%;
  box-sizing: border-box;
  border: 0 none;
}

.placeholder {
  color: @tertiaryLabel;
}
</style>
