<template>
  <AppModal v-model="isOpen" title="Forgot password?" class="sm:w-[360px]">
    <lock-screen-forgot />
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from '@common/components/modal/AppModal.vue';
import LockScreenForgot from '@action/views/lock-screen/components/lock-screen-forgot.vue';

const isOpen = defineModel<boolean>({ required: true });
</script>
