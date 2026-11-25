<template>
  <header
    class="flex w-full items-center justify-between bg-background-alternative px-4 py-1"
  >
    <img :src="appLogo" alt="Enkrypt" class="block h-7 w-auto" />
    <button
      type="button"
      aria-label="Settings"
      class="flex size-10 cursor-pointer items-center justify-center rounded-12 text-icon-default transition-colors hover:bg-background-default-hover active:bg-background-default-pressed [&_path]:fill-current"
      @click="isSettingsOpen = true"
    >
      <settings-icon />
    </button>

    <settings-dialog v-model="isSettingsOpen" />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import appLogo from '@/assets/images/logo.svg';
import SettingsIcon from '@action/icons/common/settings-icon.vue';
import SettingsDialog from '@action/modules/settings/SettingsDialog.vue';

const isSettingsOpen = ref(false);
</script>
