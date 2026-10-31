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

    <p class="text-text-sm text-text-subtle"></p>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import AppInput from '@common/components/input/AppInput.vue';
import { usePassword } from '@common/composables/usePassword';
import { useRouter } from 'vue-router';
import { routes } from './routes';
import { useOnboardStore } from './store';

const router = useRouter();

const store = useOnboardStore();
const { password, trimmedPassword, isValid, strengthFeedback } = usePassword();
const isDisabled = computed(() => !isValid.value);

const nextAction = () => {
  if (!isDisabled.value) {
    store.setPassword(trimmedPassword.value);
    router.push({
      name: routes.typePassword.name,
    });
  }
};
</script>
