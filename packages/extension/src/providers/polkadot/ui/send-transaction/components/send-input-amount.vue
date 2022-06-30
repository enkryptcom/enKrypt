<template>
  <div class="send-input-amount" :class="{ focus: isFocus }">
    <input
      type="text"
      placeholder="0"
      :value="value == 0 ? null : value"
      @input="changeValue"
      @focus="changeFocus"
      @blur="changeFocus"
    />

    <div class="send-input-amount__fiat">
      <switch-arrow-icon></switch-arrow-icon>
      <span>{{ $filters.formatFiatValue(0).value }}</span>
    </div>

    <a class="send-input-amount__max" @click="maxAction">Max</a>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendInputAmount",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import SwitchArrowIcon from "@action/icons/send/switch-arrow-icon.vue";

let isFocus = ref(false);

const props = defineProps({
  input: {
    type: Function,
    default: () => {
      return null;
    },
  },
  value: {
    type: Number,
    default: () => {
      return 0;
    },
  },
});

const changeValue = (e: any) => {
  props.input(e.target.value);
};

const changeFocus = () => {
  isFocus.value = !isFocus.value;
};

const maxAction = () => {
  console.log(maxAction);
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
}
</style>
