<template>
  <div
    class="absolute inset-0 z-5 flex flex-col items-center justify-center gap-2 bg-background-alternative p-14 text-center"
  >
    <import-done-animation class="mb-4 w-10" />
    <h3 class="text-heading-2xl">Accounts imported</h3>
    <p class="text-text-base text-text-subtle">
      You can close this tab and open Enkrypt.
    </p>
  </div>
</template>
<script setup lang="ts">
import ImportDoneAnimation from '@/assets/icons/import-done-animation.vue';
</script>
