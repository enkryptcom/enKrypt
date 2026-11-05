<template>
  <div class="flex flex-col gap-2">
    <h1 class="text-heading-2xl mt-3">Confirm your password</h1>
    <p class="text-text-sm text-text-subtle">
      Enkrypt is non-custodial. We cannot restore or reset your password for
      you. Make sure you remember it.
    </p>

    <div class="flex flex-col gap-4 py-4">
      <app-input
        v-model="typePassword"
        type="password"
        label="Password"
        :error-message="mismatchError"
        :submit-disabled="isDisabled"
        @enter="nextAction"
      />
      <app-btn
        size="large"
        :disabled="isDisabled"
        :is-loading="isInitializing"
        @click="nextAction"
        >Next</app-btn
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppBtn from '@components/buttons/AppBtn.vue';
import AppInput from '@components/input/AppInput.vue';
import { onboardInitializeWallets } from '@/libs/utils/initialize-wallet';
import { useOnboardStore } from './create-wallet/store';
import { useRestoreStore } from './restore-wallet/store';
import { OnboardRouteName } from './route-enums';

/**
 * Shared by the create and restore flows; each route record passes `flow`.
 * Create moves on to the recovery phrase; restore initializes the wallet here
 * since the phrase is already known. Navigation uses route names to avoid a
 * circular import with the flows' `routes` files.
 */
const props = defineProps<{ flow: 'create' | 'restore' }>();

const router = useRouter();
const isRestore = props.flow === 'restore';
const createStore = useOnboardStore();
const restoreStore = useRestoreStore();
const store = isRestore ? restoreStore : createStore;

const typePassword = ref('');
const isInitializing = ref(false);
const isMatch = computed(() => typePassword.value.trim() === store.password);
const isDisabled = computed(() => !isMatch.value || isInitializing.value);
const mismatchError = computed(() =>
  typePassword.value && !isMatch.value ? "Passwords don't match" : undefined,
);

const restoreWallet = () => {
  isInitializing.value = true;
  onboardInitializeWallets({
    mnemonic: restoreStore.mnemonic,
    password: restoreStore.password,
    extraWord: restoreStore.extraWord,
  })
    .then(res => {
      router.push({
        name: res.backupsFound
          ? OnboardRouteName.RestoreWalletBackupDetected
          : OnboardRouteName.RestoreWalletReady,
      });
    })
    .catch(error => {
      console.error('Wallet initialization failed:', error);
    })
    .finally(() => {
      isInitializing.value = false;
    });
};

const nextAction = () => {
  if (isDisabled.value) return;
  if (isRestore) restoreWallet();
  else router.push({ name: OnboardRouteName.CreateWalletRecoveryPhrase });
};

onMounted(() => {
  if (isRestore) {
    if (!restoreStore.password || !restoreStore.mnemonic) {
      router.push({ name: OnboardRouteName.RestoreWalletEnterRecoveryPhrase });
    }
  } else if (!createStore.password) {
    router.push({ name: OnboardRouteName.CreateWalletPickPassword });
  }
});
</script>
