<template>
  <div
    class="flex flex-col justify-center items-center gap-4 p-5 text-text-xs text-text-subtle"
  >
    <ledger-connection v-if="isLedger" class="w-10" />
    <trezor-connection v-else class="w-10" />
    <p v-if="isConnetion" class="animate-pulse">Connecting ...</p>
    <p v-if="!isConnetion">Importing account</p>
  </div>
</template>
<script setup lang="ts">
import LedgerConnection from '@/assets/icons/hardware/ledger-connection.vue';
import TrezorConnection from '@/assets/icons/hardware/trezor-connection.vue';

defineProps({
  isLedger: {
    type: Boolean,
    default: false,
  },
  isConnetion: {
    type: Boolean,
    default: false,
  },
});
</script>
