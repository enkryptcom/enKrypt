<template>
  <div class="flex flex-col gap-2 pb-4">
    <div class="flex h-14 w-full items-center gap-3 rounded-12 px-3">
      <span v-if="!noIndex" class="w-4 text-text-xs text-text-subtle">{{
        index
      }}</span>
      <app-avatar
        type="account"
        size="m"
        :address="address"
        :url="
          network.identicon
            ? network.identicon(network.displayAddress(address))
            : undefined
        "
      />
      <span class="flex flex-col">
        <span class="text-label-base">
          {{
            $filters.replaceWithEllipsis(
              network.displayAddress ? network.displayAddress(address) : '',
              6,
              4,
            )
          }}
        </span>
        <span class="text-text-xs text-text-subtle">
          {{ balance }} {{ network.currencyName ?? '' }}
        </span>
      </span>
    </div>

    <app-input
      :model-value="nameValue"
      label="Account nickname"
      :error-message="isError ? 'This name is already in use' : undefined"
      @update:model-value="emit('update:value', $event ?? '')"
    />
  </div>
</template>

<script setup lang="ts">
import { BaseNetwork } from '@/types/base-network';
import AppAvatar from '@components/avatar/AppAvatar.vue';
import AppInput from '@components/input/AppInput.vue';
import { PropType } from 'vue';

const emit = defineEmits<{
  (e: 'update:value', value: string): void;
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
  index: {
    type: Number,
    default: 0,
  },
  balance: {
    type: String,
    default: '',
  },
  nameValue: {
    type: String,
    default: '',
  },
  isError: Boolean,
  noIndex: Boolean,
});
</script>
