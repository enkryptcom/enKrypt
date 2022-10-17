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
    <span>{{ title }}</span>
  </a>
</template>

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
  red: {
    type: Boolean,
    default: false,
  },
  gray: {
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
  background-color: @primary;
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
  position: relative;
  overflow: hidden;
  overflow: hidden;

  span {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
    left: 0;
    top: 0;
  }

  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1;
    opacity: 0;
    background: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0.08)
      ),
      @primary;
    transition: opacity 300ms ease-in-out;
    border-radius: 10px;
  }

  &:hover {
    &::after {
      opacity: 1;
    }
  }

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

    &::after {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &.gray {
    background: @buttonBg;
    box-shadow: none;
    color: @primaryLabel;

    &::after {
      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.08),
          rgba(255, 255, 255, 0.08)
        ),
        @buttonBg !important;
    }
  }

  &.red {
    background: @error;
    color: @white;

    &::after {
      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.08),
          rgba(255, 255, 255, 0.08)
        ),
        @error !important;
    }
  }

  &.orange {
    background: @orange;
    color: @white;

    &::after {
      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.08),
          rgba(255, 255, 255, 0.08)
        ),
        @orange !important;
    }
  }
}
</style>
