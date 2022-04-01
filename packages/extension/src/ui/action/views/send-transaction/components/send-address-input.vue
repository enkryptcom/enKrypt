<template>
  <div class="send-address-input">
    <p>То:</p>
    <input
      type="text"
      placeholder="0x… address or ENS name"
      @input="changeValue($event.target.value)"
      @focus="changeFocus"
      @blur="changeFocus"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "SendAddressInput",
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
  changeFocus: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const changeValue = (text: string) => {
  props.input(text);
};

const changeFocus = () => {
  isFocus.value = !isFocus.value;
  props.changeFocus(isFocus.value);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-address-input {
  height: 56px;
  background: #FFFFFF;
  box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.1); 
  padding: 4px 32px 10px 32px;
  box-sizing: border-box;

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;
    margin: 0 0 6px 0;
  }

  input {
    width: 100%;
    height: 20px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
  }
}
</style>
