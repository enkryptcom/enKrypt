<template>
  <a
    class="button"
    :class="{
      alternative: noBackground,
      disabled: disabled,
      gray: gray,
      red: red,
      orange: orange,
    }"
    @click="click()"
  >
    {{ title }}
  </a>
</template>

<script lang="ts">
export default {
  name: "BaseButton",
};
</script>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: "",
  },
  noBackground: {
    type: Boolean,
    default: false,
  },
  click: {
    type: Function,
    default: () => ({}),
  },
  disabled: Boolean,
  gray: {
    type: Boolean,
    default: false,
  },
  red: {
    type: Boolean,
    default: false,
  },
  orange: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.button {
  background: @primary;
  box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.039),
    0px 0.85px 3px rgba(0, 0, 0, 0.19);
  border-radius: 10px;
  display: inline-block;
  width: 100%;
  height: 40px;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 40px;
  letter-spacing: 0.5px;
  color: @white;
  text-align: center;
  cursor: pointer;

  &.disabled {
    pointer-events: none;
    background: rgba(95, 99, 104, 0.1) !important;
    color: rgba(0, 0, 0, 0.2) !important;
    box-shadow: none !important;
  }

  &.alternative {
    color: @primaryLabel;
    background: transparent;
    box-shadow: none;
  }

  &.gray {
    background: @buttonBg;
    box-shadow: none;
    color: @primaryLabel;
  }

  &.red {
    background: @error;
    color: @white;
  }

  &.orange {
    background: @orange;
    color: @white;
  }
}
</style>
