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
      <app-btn size="large" :disabled="isDisabled" @click="nextAction"
        >Next</app-btn
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import AppInput from '@common/components/input/AppInput.vue';
import { useRouter } from 'vue-router';
import { routes } from './routes';
import { useOnboardStore } from './store';

const router = useRouter();
const store = useOnboardStore();

const password = store.password;

const typePassword = ref('');
const isDisabled = computed(() => typePassword.value.trim() !== password);
const mismatchError = computed(() =>
  typePassword.value && isDisabled.value ? "Passwords don't match" : undefined,
);

const nextAction = () => {
  if (!isDisabled.value) {
    router.push({
      name: routes.recoveryPhrase.name,
    });
  }
};

onMounted(() => {
  if (!password) {
    router.push({ path: routes.pickPassword.path });
  }
});
</script>
