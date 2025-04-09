<template>
  <div class="lock-screen__container">
    <div
      v-show="!isForgot && !isLocked && !isUnlocking"
      class="lock-screen__wrap"
    >
      <logo-big class="lock-screen__logo" />
      <h4>Unlock with password</h4>
      <lock-screen-password-input
        :is-error="isError"
        :value="password"
        @update:value="passwordChanged"
        @keyup.enter="unlockAction"
      />
      <base-button
        title="Unlock"
        :click="unlockAction"
        :disabled="isDisabled"
      />
    </div>

    <div v-show="isUnlocking" class="lock-screen__unlocking">
      <swap-looking-animation />
    </div>

    <lock-screen-forgot
      v-show="isForgot"
      :reset="resetAction"
      @toggle:forgot="toggleForgot"
    />

    <lock-screen-timer v-show="isLocked" :close="closeLockedAction" />

    <base-button
      v-show="!isForgot && !isUnlocking"
      title="I forgot my password"
      :click="forgotAction"
      :no-background="true"
      class="lock-screen__forgot"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LogoBig from '@action/icons/common/logo-big.vue';
import BaseButton from '@action/components/base-button/index.vue';
import LockScreenPasswordInput from './components/lock-screen-password-input.vue';
import LockScreenForgot from './components/lock-screen-forgot.vue';
import LockScreenTimer from './components/lock-screen-timer.vue';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import { InternalMethods } from '@/types/messenger';
import { computed } from 'vue';
import SwapLookingAnimation from '@action/icons/swap/swap-looking-animation.vue';
import { trackGenericEvents } from '@/libs/metrics';
import { GenericEvents } from '@/libs/metrics/types';

const emit = defineEmits<{
  (e: 'update:init'): void;
}>();

const password = ref(__PREFILL_PASSWORD__!);
const isDisabled = computed(() => {
  return password.value.length < 5 || isUnlocking.value;
});
const isError = ref(false);
const isForgot = ref(false);
const isLocked = ref(false);
const isUnlocking = ref(false);

const unlockAction = async () => {
  isUnlocking.value = true;
  const unlockStatus = await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.unlock,
      params: [password.value.trim(), true],
    }),
  });
  if (unlockStatus.error) {
    isError.value = true;
    isUnlocking.value = false;
    trackGenericEvents(GenericEvents.login_error);
  } else {
    isError.value = false;
    password.value = '';
    emit('update:init');
    setTimeout(() => (isUnlocking.value = false), 750);
    trackGenericEvents(GenericEvents.login_success);
  }
};
const forgotAction = () => {
  toggleForgot();
};
const passwordChanged = (text: string) => {
  password.value = text;
  isError.value = false;
};
const toggleForgot = () => {
  isForgot.value = !isForgot.value;
};
const resetAction = () => {
  password.value = '';
};
const closeLockedAction = () => {
  isLocked.value = false;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.lock-screen {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  &__container {
    height: 600px;
    width: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
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
  &__unlocking {
    width: 300px;
    height: 300px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: relative;

    svg {
      width: 132px;
      position: relative;
      z-index: 2;
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
