<template>
  <div class="lock-screen-password-input">
    <base-input
      type="password"
      value=""
      placeholder="Password"
      class="lock-screen-password-input__input"
      :is-error="isError"
      :input="input"
    />
    <p v-show="isError" class="lock-screen-password-input__error">
      Wrong password
    </p>
  </div>
</template>

<script lang="ts">
export default {
  name: "LockScreenPasswordInput",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import BaseInput from "@action/components/base-input/index.vue";

var password = ref("");

const props = defineProps({
  input: {
    type: Function,
    default: () => {
      return null;
    },
  },
  isError: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

const input = (text: string) => {
  password.value = text;
  const isValid = text.length > 6;
  props.input(text, isValid);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.lock-screen-password-input {
  padding: 0 0 39px 0;
  width: 100%;
  position: relative;
  box-sizing: border-box;

  &__input {
    margin: 0;
  }

  &__error {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0;
    position: absolute;
    left: 12px;
    bottom: 15px;
  }
}
</style>
