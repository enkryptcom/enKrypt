<template>
  <span
    :class="[
      'inline-flex shrink-0 items-center justify-center',
      ICON_CONTAINER_TONE_CLASS[tone],
    ]"
  >
    <AppIcon :name="icon" :size="size" variant="filled" />
  </span>
</template>

<script setup lang="ts">
import AppIcon from '@common/components/icon/AppIcon.vue';
import type { IconName, IconSize } from '@common/components/icon/icons';
import { ICON_CONTAINER_TONE_CLASS, type IconContainerTone } from './types';

/**
 * A status glyph tinted by `tone` (filled variant), as used by AppBanner.
 * Decorative: pair it with visible or sr-only text.
 */
withDefaults(
  defineProps<{
    icon: IconName;
    tone?: IconContainerTone;
    size?: IconSize;
  }>(),
  { tone: 'default', size: 'm' },
);
</script>
