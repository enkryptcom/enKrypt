<template>
  <div class="w-full flex-col items-center justify-center p-6 text-center">
    <import-error-animation class="shrink-0 w-10" />
    <h1 class="mt-6 text-text-base font-semibold text-text-error">
      Unable to connect to {{ isLedger ? 'Ledger' : 'Trezor' }}
    </h1>

    <p class="mt-2 mb-6 break-words text-text-xs text-text-error">
      {{ errorMessage }}
    </p>
    <app-btn class="w-full" size="large" @click="emit('retryConnection')"
      >Retry</app-btn
    >
  </div>
</template>
<script setup lang="ts">
import ImportErrorAnimation from '@/assets/icons/import-error-animation.vue';
import AppBtn from '@common/components/buttons/AppBtn.vue';

const emit = defineEmits<{
  (e: 'retryConnection'): void;
}>();

defineProps({
  isLedger: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  appName: {
    type: String,
    default: '',
  },
});
</script>
