<template>
  <div class="password-input">
    <base-input
      type="password"
      placeholder="Password"
      class="password-input__input"
      :value="password"
      @update:value="passwordChanged"
    />
    <password-input-strength :value="password" v-bind="$attrs" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseInput from "@action/components/base-input/index.vue";
import PasswordInputStrength from "./components/password-input-strength.vue";

const password = ref("");
const passwordChanged = (newVal: string) => {
  password.value = newVal;
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
