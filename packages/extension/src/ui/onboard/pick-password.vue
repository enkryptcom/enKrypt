<template>
  <div class="flex flex-col gap-2">
    <h1 class="text-heading-2xl mt-3">Pick a password</h1>
    <p class="text-text-sm text-text-subtle">
      This will be used to unlock your wallet. Best passwords are long and
      contain letters, numbers and special characters.
    </p>

    <div class="flex flex-col gap-4 py-4">
      <app-input
        v-model="password"
        type="password"
        label="Password"
        :feedback="strengthFeedback"
        :submit-disabled="isDisabled"
        @enter="nextAction"
      />
      <app-btn size="large" :disabled="isDisabled" @click="nextAction"
        >Next</app-btn
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppBtn from '@components/buttons/AppBtn.vue';
import AppInput from '@components/input/AppInput.vue';
import { usePassword } from '@common/composables/usePassword';
import { useOnboardStore } from './create-wallet/store';
import { useRestoreStore } from './restore-wallet/store';
import { OnboardRouteName } from './route-enums';

/**
 * Shared by the create and restore flows; each route record passes `flow`.
 * Navigation uses route names (not the flows' `routes` objects) because those
 * files import this component — importing them back would be circular.
 */
const props = defineProps<{ flow: 'create' | 'restore' }>();

const router = useRouter();
const isRestore = props.flow === 'restore';
const store = isRestore ? useRestoreStore() : useOnboardStore();
const nextRouteName = isRestore
  ? OnboardRouteName.RestoreWalletTypePassword
  : OnboardRouteName.CreateWalletTypePassword;

const { password, trimmedPassword, isValid, strengthFeedback } = usePassword();
const isDisabled = computed(() => !isValid.value);

const nextAction = () => {
  if (isDisabled.value) return;
  store.setPassword(trimmedPassword.value);
  router.push({ name: nextRouteName });
};

onMounted(() => {
  // Restore needs the phrase from the previous step
  if (isRestore && !store.mnemonic) {
    router.push({ name: OnboardRouteName.RestoreWalletEnterRecoveryPhrase });
  }
});
</script>
