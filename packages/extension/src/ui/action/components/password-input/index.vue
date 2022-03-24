<template>
  <div class="password-input">
    <base-input
      type="password"
      value=""
      placeholder="Password"
      class="password-input__input"
      :input="input"
    />
    <password-input-strenght :value="password" />
  </div>
</template>

<script lang="ts">
export default {
  name: "PasswordInput",
};
</script>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import BaseInput from "@action/components/base-input/index.vue";
import PasswordInputStrenght from "./components/password-input-strenght.vue";

var password = ref("");

const props = defineProps({
  input: {
    type: Function,
    default: () => {
      return null;
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

.password-input {
  margin: 0 0 16px 0;
  width: 100%;
  position: relative;
  box-sizing: border-box;

  &__input {
    margin: 0 0 16px 0;
  }
}
</style>
