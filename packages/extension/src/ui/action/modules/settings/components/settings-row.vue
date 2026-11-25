<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    class="group relative flex h-6 w-full items-center justify-between gap-3 text-left"
    :class="{
      'cursor-pointer before:absolute before:inset-x-0 before:-inset-y-3':
        interactive,
    }"
    @click="interactive && emit('click')"
  >
    <!-- Hit area: the invisible ::before reaches 12px above and below, half
         of the 24px gap between rows, so neighbouring rows meet without
         overlapping and the layout spacing is unchanged. -->
    <!-- Hover plate bleeds past the row so the text stays on the grid. -->
    <div
      v-if="interactive"
      class="absolute -inset-x-2 -inset-y-[7px] rounded-8 bg-background-default opacity-0 transition-opacity duration-150 group-hover:opacity-100"
    />

    <div class="relative flex min-w-0 items-center gap-2.5">
      <AppIcon
        :name="icon"
        variant="filled"
        size="s"
        class="shrink-0"
        :class="isError ? 'text-text-error' : 'text-text-brand'"
      />
      <span
        class="truncate text-text-base"
        :class="isError ? 'text-text-error' : 'text-text-default'"
      >
        {{ label }}
      </span>
      <AppTooltip v-if="description" :text="description" class="shrink-0">
        <AppIcon
          name="question-mark-circle"
          variant="filled"
          size="xxs"
          :label="description"
          class="cursor-help text-text-placeholder"
        />
      </AppTooltip>
    </div>

    <div class="relative flex min-w-0 shrink-0 items-center gap-2">
      <slot name="value">
        <span v-if="value" class="truncate text-text-sm text-text-subtle">
          {{ value }}
        </span>
      </slot>
      <slot name="trailing">
        <AppIcon
          v-if="trailing !== 'none'"
          :name="trailing === 'external' ? 'arrow-up-right' : 'chevron-right'"
          variant="filled"
          size="xxs"
          class="shrink-0 text-text-subtle"
        />
      </slot>
    </div>
  </component>
</template>

<script setup lang="ts">
import AppIcon from '@common/components/icon/AppIcon.vue';
import type { IconName } from '@common/components/icon/icons';
import AppTooltip from '@common/components/tooltip/AppTooltip.vue';

/**
 * One line of the settings panel: brand icon + label on the left, an optional
 * value and a chevron / external arrow on the right. Non-interactive rows
 * (`:interactive="false"`) host a control such as a toggle in `#trailing`.
 */
withDefaults(
  defineProps<{
    icon: IconName;
    label: string;
    value?: string;
    /** Tooltip on a question-mark icon next to the label. */
    description?: string;
    trailing?: 'chevron' | 'external' | 'none';
    interactive?: boolean;
    isError?: boolean;
  }>(),
  {
    value: undefined,
    description: undefined,
    trailing: 'chevron',
    interactive: true,
    isError: false,
  },
);

const emit = defineEmits<{ click: [] }>();
</script>
