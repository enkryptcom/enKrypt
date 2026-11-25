<template>
  <div class="relative h-14 w-full bg-background-default px-14 py-3.5">
    <AppBtnIcon
      v-if="hasBack"
      icon="chevron-left"
      label="Back"
      class="absolute top-2 left-2"
      @click="$emit('window:back')"
    />

    <h2 class="m-0 text-center text-heading-base text-text-default">
      <template v-if="isGeneral">General</template>
      <template v-else-if="isAbout">About</template>
      <template v-else-if="isSupport">Support</template>
      <template v-else-if="isPhrase">Recovery phrase</template>
      <template v-else-if="isReset">Reset wallet?</template>
      <template v-else-if="isBackups">Settings backup</template>
    </h2>

    <AppBtnIcon
      icon="x-mark"
      label="Close"
      class="absolute top-2 right-2"
      @click="$emit('window:close')"
    />
  </div>
</template>

<script setup lang="ts">
import AppBtnIcon from '@common/components/buttons/AppBtnIcon.vue';

defineEmits<{
  (e: 'window:close'): void;
  (e: 'window:back'): void;
}>();

withDefaults(
  defineProps<{
    hasBack?: boolean;
    isGeneral?: boolean;
    isSupport?: boolean;
    isAbout?: boolean;
    isPhrase?: boolean;
    isReset?: boolean;
    isBackups?: boolean;
  }>(),
  {
    hasBack: true,
    isGeneral: false,
    isSupport: false,
    isAbout: false,
    isPhrase: false,
    isReset: false,
    isBackups: false,
  },
);
</script>
