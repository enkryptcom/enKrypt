<template>
  <div class="lock-screen__container">
    <div v-show="!isForgot && !isLocked" class="lock-screen__wrap">
      <logo-big class="lock-screen__logo" />
      <h4>Unlock with password</h4>
      <lock-screen-password-input :input="input" :is-error="isError" />
      <base-button
        title="Unlock"
        :click="unlockAction"
        :disabled="isDisabled"
      />
    </div>

    <lock-screen-forgot
      v-show="isForgot"
      :close="toggleForgot"
      :reset="resetAction"
    />

    <lock-screen-timer v-show="isLocked" :close="closeLockedAction" />

    <base-button
      v-show="!isForgot"
      title="I forgot my password"
      :click="forgotAction"
      :no-background="true"
      class="lock-screen__forgot"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "LockScreen",
};
</script>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import LogoBig from "@action/icons/common/logo-big.vue";
import BaseButton from "@action/components/base-button/index.vue";
import LockScreenPasswordInput from "./components/lock-screen-password-input.vue";
import LockScreenForgot from "./components/lock-screen-forgot.vue";
import LockScreenTimer from "./components/lock-screen-timer.vue";

var password = ref("");
var isDisabled = ref(true);
const isError = ref(false);
let isForgot = ref(false);
let isLocked = ref(false);

defineProps({});

const unlockAction = () => {
  console.log("unlockAction");
};

const forgotAction = () => {
  toggleForgot();
};

const input = (text: string, isValid: boolean) => {
  password.value = text;
  isDisabled.value = !isValid;
};

const toggleForgot = () => {
  isForgot.value = !isForgot.value;
};

const resetAction = () => {
  console.log("reset");
};

const closeLockedAction = () => {
  isLocked.value = false;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.lock-screen {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  &__container {
    width: 800px;
    height: 600px;
    overflow-x: hidden;
    overflow-y: scroll;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;
    background: radial-gradient(
        100% 50% at 100% 50%,
        rgba(250, 250, 250, 0.92) 0%,
        rgba(250, 250, 250, 0.98) 100%
      )
      @primary;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  &__wrap {
    width: 320px;
    height: auto;
    box-sizing: border-box;
    position: relative;

    h4 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0 0 8px 0;
    }
  }

  &__logo {
    margin-bottom: 24px;
  }

  &__forgot {
    position: absolute;
    width: 320px;
    left: 50%;
    margin-left: -160px;
    bottom: 20px;
  }
}
</style>
