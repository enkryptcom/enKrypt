<template>
  <div class="px-6 pb-5">
    <p class="mb-2 text-text-base text-text-subtle">
      Enkrypt cannot recover your password for you. If you're having trouble
      unlocking your account, you will need to reset your wallet.
    </p>

    <AppBanner
      type="alert"
      title="Warning!"
      description="Do not reset your wallet if you do not have your recovery phrase. There will be no way to restore your account and you could lose all of your assets."
      class="my-6 bg-background-error-subtle"
    />

    <AppInput
      v-model="reset"
      label="Type Reset"
      surface="alternative"
      :submit-disabled="isDisabled"
      class="mb-6"
      @enter="resetAction"
    />

    <AppBtn
      tone="danger"
      surface="alternative"
      class="mb-6 w-full"
      :disabled="isDisabled"
      :is-loading="isProcessing"
      @click="resetAction"
    >
      Reset wallet
    </AppBtn>

    <p class="text-text-sm text-text-subtle">
      Still need help?
      <a
        href="mailto:support@enkrypt.com"
        class="text-text-brand underline hover:no-underline"
        >Contact support</a
      >
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import AppBanner from '@common/components/banner/AppBanner.vue';
import AppInput from '@common/components/input/AppInput.vue';
import KeyRingBase from '@/libs/keyring/keyring';
import openOnboard from '@/libs/utils/open-onboard';

const reset = ref('');
const isProcessing = ref(false);

const isDisabled = computed(
  () => reset.value !== 'Reset' || isProcessing.value,
);

const resetAction = async () => {
  if (isDisabled.value) return;
  isProcessing.value = true;
  const keyring = new KeyRingBase();
  await keyring.reset();
  openOnboard();
};
</script>
