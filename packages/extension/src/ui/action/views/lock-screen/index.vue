<template>
  <div
    class="fixed inset-0 z-[999] flex h-[600px] gap-3 w-full flex-col items-center justify-center overflow-hidden bg-background-alternative text-text-default"
  >
    <div
      v-show="!isLocked && !isUnlocking"
      class="flex w-[320px] flex-col items-start justify-center gap-6"
    >
      <img :src="appLogo" alt="MEW" class="h-10" />
      <h1 class="text-heading-lg">Unlock with password</h1>
      <AppInput
        v-model="password"
        type="password"
        label="Password"
        :error-message="isError ? 'Wrong password' : undefined"
        :submit-disabled="isDisabled"
        @enter="unlockAction"
      />
      <AppBtn class="w-full" :disabled="isDisabled" @click="unlockAction">
        Unlock
      </AppBtn>
    </div>

    <div
      v-show="isUnlocking"
      class="flex size-[300px] items-center justify-center [&_svg]:w-[132px]"
    >
      <swap-looking-animation />
    </div>

    <lock-screen-timer v-show="isLocked" :close="closeLockedAction" />

    <AppBtn
      v-show="!isUnlocking"
      type="tertiary"
      class="w-full max-w-[320px]"
      @click="isForgot = true"
    >
      I forgot my password
    </AppBtn>

    <modal-forgot v-model="isForgot" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import appLogo from '@/assets/images/logo.svg';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import AppInput from '@common/components/input/AppInput.vue';
import ModalForgot from '@action/views/modal-forgot/index.vue';
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
  if (isDisabled.value) return;
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
watch(password, () => {
  isError.value = false;
});
const closeLockedAction = () => {
  isLocked.value = false;
};
</script>
