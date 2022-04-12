<template>
  <div class="send-input-amount" :class="{ focus: isFocus }">
    <input
      type="number"
      placeholder="0"
      @input="changeValue($event.target.value)"
      @focus="changeFocus"
      @blur="changeFocus"
      :value="value"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SendInputAmount",
};
</script>

<script setup lang="ts">
import { defineProps, ref } from "vue";

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

const changeValue = (text: string) => {
  props.input(text);
};

const changeFocus = () => {
  isFocus.value = !isFocus.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-input-amount {
  height: 100px;
  background: #FFFFFF;
  margin: 0 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;

  &.focus {
    border: 1px solid @primary;
  }

  input {
    width: 290px;
    height: 24px;
    font-style: normal;
    font-weight: 400;
    font-size: 34px;
    line-height: 40px;
    text-align: center;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
    padding: 0;
  }
}
</style>
