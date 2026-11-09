<template>
  <!-- The whole row is the checkbox label, so clicking anywhere toggles it -->
  <app-checkbox
    :model-value="selected"
    :disabled="disabled"
    :class="[
      'h-14 w-full flex-row-reverse justify-between !items-center rounded-12 px-3 transition-colors',
      disabled
        ? 'bg-background-success-subtle'
        : selected
          ? 'bg-background-default-selected'
          : 'hover:bg-background-default-hover',
    ]"
    @update:model-value="emit('toggle:select')"
  >
    <span class="flex items-center gap-3">
      <span class="w-4 text-text-xs text-text-subtle">{{ index }}</span>
      <app-avatar
        type="account"
        size="m"
        :address="address"
        :url="network.identicon(network.displayAddress(address))"
      />
      <span class="flex flex-col">
        <span class="text-label-base">
          {{
            $filters.replaceWithEllipsis(network.displayAddress(address), 6, 4)
          }}
          <span v-if="disabled" class="text-text-subtle">(imported)</span>
        </span>
        <span class="text-text-xs text-text-subtle">
          {{ balance }} {{ network.currencyName }}
        </span>
      </span>
    </span>
  </app-checkbox>
</template>

<script setup lang="ts">
import { BaseNetwork } from '@/types/base-network';
import AppAvatar from '@components/avatar/AppAvatar.vue';
import AppCheckbox from '@components/buttons/AppCheckbox.vue';
import { PropType } from 'vue';

const emit = defineEmits<{
  (e: 'toggle:select'): void;
}>();

defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  address: {
    type: String,
    default: '',
  },
  selected: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: 0,
  },
  balance: {
    type: String,
    default: '',
  },
  disabled: Boolean,
});
</script>
