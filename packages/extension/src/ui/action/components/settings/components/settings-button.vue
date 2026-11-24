<template>
  <button
    type="button"
    class="relative flex h-12 w-full cursor-pointer items-center rounded-12 px-4 py-3 text-left transition-colors duration-300 bg-background-alternative"
    :class="
      isRed
        ? ' hover:bg-background-error-subtle-hover'
        : ' text-text-brand hover:bg-background-default-hover  active:bg-background-default-pressed'
    "
    @click="$emit('click')"
  >
    <p
      class="m-0 min-w-0 flex-1 pr-8 text-text-base leading-6"
      :class="isRed ? 'text-text-error' : 'text-text-default'"
    >
      {{ title }}
    </p>
    <AppIcon
      v-if="!isRed"
      :name="isLink ? 'arrow-up-right' : 'chevron-right'"
      :size="isLink ? 'xxs' : 's'"
      class="absolute top-1/2 right-4 -translate-y-1/2 text-icon-default"
    />
  </button>
</template>

<script setup lang="ts">
import AppIcon from '@common/components/icon/AppIcon.vue';

defineEmits<{
  (e: 'click'): void;
}>();

withDefaults(
  defineProps<{
    title?: string;
    isRed?: boolean;
    isLink?: boolean;
  }>(),
  {
    title: '',
    isRed: false,
    isLink: false,
  },
);
</script>
