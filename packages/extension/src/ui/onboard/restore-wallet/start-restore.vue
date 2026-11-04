<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-heading-2xl mt-3">Restore an<br />existing wallet</h1>
    <p class="text-text-sm text-text-subtle">
      Use a 12 to 24 word recovery phrase to restore the accounts in your
      wallet.
    </p>

    <app-btn class="mt-3" size="large" @click="restoreAction"
      >Use recovery phrase</app-btn
    >
    <app-btn size="large" type="tertiary" @click="otherAction"
      >Other options</app-btn
    >
  </div>
</template>
<script setup lang="ts">
import AppBtn from '@common/components/buttons/AppBtn.vue';
import { useRouter } from 'vue-router';
import { routes } from './routes';
const router = useRouter();

const restoreAction = () => {
  router.push({ name: routes.enterRecoveryPhrase.name });
};

const otherAction = () => {
  router.push({ name: routes.otherInfo.name });
};
</script>
