<template>
  <app-select
    v-model:selected="selectedOption"
    :options="options"
    placeholder="Derivation path"
    position="inset-x-0"
    :max-visible-items="5"
  >
    <template #select-button="{ toggleSelect, openSelect }">
      <button
        type="button"
        class="flex h-16 w-full items-center gap-2 rounded-2xl bg-background-formfield px-4 transition-colors hover:bg-background-formfield-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        :aria-expanded="openSelect"
        aria-haspopup="listbox"
        @click="toggleSelect"
      >
        <div class="mr-auto text-left">
          <p class="text-text-xs text-text-subtle mb-1">Derivation path</p>
          <p class="ml-auto truncate text-label-base">
            {{ selectedPath.label }} -
            <span class="text-text-sm">{{ selectedPath.basePath }}</span>
          </p>
        </div>

        <app-icon
          name="chevron-down"
          size="xxs"
          :class="[
            'shrink-0 text-icon-default transition-transform',
            { 'rotate-180': openSelect },
          ]"
        />
      </button>
    </template>
  </app-select>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import AppSelect from '@components/select/AppSelect.vue';
import AppIcon from '@components/icon/AppIcon.vue';
import type { AppSelectOption } from '@components/select/types';
import { PathType } from '../types';

const emit = defineEmits<{
  (e: 'update:selectedPath', path: PathType): void;
}>();

const props = defineProps({
  paths: {
    type: Array as PropType<PathType[]>,
    default: () => [],
  },
  selectedPath: {
    type: Object as PropType<PathType>,
    default: () => ({}),
  },
});

const toOption = (path: PathType): AppSelectOption => ({
  label: path.label ?? path.path,
  value: path.path,
  description: path.path,
});

const options = computed(() => props.paths.map(toOption));

// AppSelect works with options; map back to the PathType the parent expects
const selectedOption = computed({
  get: () =>
    props.selectedPath.path ? toOption(props.selectedPath) : undefined,
  set: option => {
    const path = props.paths.find(p => p.path === option?.value);
    if (path) emit('update:selectedPath', path);
  },
});
</script>
