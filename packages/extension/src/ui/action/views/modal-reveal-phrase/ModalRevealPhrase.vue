<template>
  <AppModal
    v-model="isOpen"
    :title="
      isForgot
        ? 'Forgot password?'
        : isUnlock
          ? 'Unlock with password'
          : 'Confirm with password'
    "
    :show-back-button="isForgot"
    class="max-w-[360px] px-2"
    @closed="reset"
    @back="isForgot = false"
  >
    <lock-screen-forgot v-if="isForgot" />

    <div v-else class="pt-5">
      <AppInput
        v-model="password"
        type="password"
        label="Password"
        surface="alternative"
        :error-message="isError ? 'Wrong password' : undefined"
        :submit-disabled="isDisabled"
        @keyup.enter="unlock"
      />
    </div>

    <template v-if="!isForgot" #footer>
      <div class="flex flex-col gap-2">
        <AppBtn
          class="w-full"
          surface="alternative"
          :disabled="isDisabled"
          :is-loading="isProcessing"
          @click="unlock"
        >
          {{ isUnlock ? 'Unlock' : 'Confirm' }}
        </AppBtn>
        <AppBtn
          type="tertiary"
          surface="alternative"
          class="w-full"
          @click="isForgot = true"
        >
          I forgot my password
        </AppBtn>
      </div>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AppModal from '@common/components/modal/AppModal.vue';
import AppInput from '@common/components/input/AppInput.vue';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import LockScreenForgot from '@action/views/lock-screen/components/lock-screen-forgot.vue';
import KeyRingBase from '@/libs/keyring/keyring';
import { MnemonicWithExtraWord } from '@enkryptcom/types';

defineProps({
  isUnlock: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'action:recoveryPhrase', val: MnemonicWithExtraWord): void;
}>();

const isOpen = defineModel<boolean>({ required: true });
const password = ref('');
const isError = ref(false);
const isForgot = ref(false);
const isProcessing = ref(false);

const isDisabled = computed(
  () => password.value.length < 5 || isProcessing.value,
);

watch(password, () => {
  isError.value = false;
});

// Start clean next time it opens.
const reset = () => {
  password.value = '';
  isError.value = false;
  isForgot.value = false;
};

const unlock = () => {
  if (isDisabled.value) return;
  isProcessing.value = true;
  const keyring = new KeyRingBase();
  keyring
    .getMnemonic(password.value)
    .then(mnemonic => {
      emit('action:recoveryPhrase', mnemonic);
    })
    .catch(() => {
      isError.value = true;
    })
    .finally(() => (isProcessing.value = false));
};
</script>
