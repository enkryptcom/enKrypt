<template>
  <div class="flex flex-col gap-6">
    <p class="text-text-base text-text-subtle">
      Choose the currency used to display prices and balances across the app
    </p>

    <ul class="flex flex-col gap-1">
      <li v-for="option in options" :key="option.fiat_currency">
        <button
          type="button"
          class="group relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-12 p-3 text-left"
          :class="{ 'bg-background-brand-subtle': isSelected(option) }"
          @click="select(option.fiat_currency)"
        >
          <div
            v-if="!isSelected(option)"
            class="absolute inset-0 rounded-12 bg-background-default opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          />
          <div class="relative flex min-w-0 items-center gap-2.5">
            <img
              :src="option.img"
              alt=""
              class="size-6 shrink-0 rounded-full object-cover"
            />
            <span class="text-label-sm text-text-default">
              {{ option.fiat_currency }}
            </span>
          </div>
          <AppIcon
            name="check-circle"
            variant="filled"
            size="s"
            class="relative shrink-0 transition-colors duration-150"
            :class="
              isSelected(option)
                ? 'text-text-brand'
                : 'invisible text-icon-disabled group-hover:visible'
            "
          />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import AppIcon from '@common/components/icon/AppIcon.vue';
import { useCurrencyStore, type Currency } from '@action/store/currency-store';

const emit = defineEmits<{ (e: 'selected'): void }>();

const store = useCurrencyStore();
const { currentSelectedCurrency, currencyList } = storeToRefs(store);

const isSelected = (c: Currency) =>
  c.fiat_currency === currentSelectedCurrency.value;

// Selected currency pinned to the top, the store's order after it.
const options = computed(() => [
  ...currencyList.value.filter(isSelected),
  ...currencyList.value.filter(c => !isSelected(c)),
]);

const select = async (code: string) => {
  await store.setSelectedCurrency(code);
  emit('selected');
};
</script>
