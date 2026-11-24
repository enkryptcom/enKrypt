<template>
  <div>
    <settings-inner-header
      v-if="showHeader"
      v-bind="$attrs"
      :is-phrase="true"
      :has-back="hasBack"
    />

    <div class="flex flex-col gap-4 px-8">
      <AppBanner
        type="alert"
        description="Please keep your recovery phrase safe. If you give it to somebody, they will have full control of your funds."
      />

      <!-- Column-first so numbering runs down the left column, then the right. -->
      <ol
        class="grid grid-flow-col grid-cols-2 gap-x-4 gap-y-1 rounded-12 border border-border-subtle bg-background-default px-4 py-2 select-text"
        :style="{ gridTemplateRows: `repeat(${rows}, auto)` }"
      >
        <li
          v-for="(word, index) in words"
          :key="index"
          class="flex items-baseline gap-2 text-heading-base font-normal text-text-default"
        >
          <span class="w-6 shrink-0 text-text-xs text-text-subtle">
            {{ index + 1 }}
          </span>
          {{ word }}
        </li>
      </ol>

      <div v-if="hasExtraWord" class="flex flex-col gap-1.5">
        <p class="text-label-base">Extra Word:</p>
        <p
          class="rounded-12 border border-border-subtle bg-background-default px-4 py-2.5 text-text-base text-text-default select-text"
        >
          {{ mnemonic.extraWord }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SettingsInnerHeader from '@action/components/settings/components/settings-inner-header.vue';
import AppBanner from '@common/components/banner/AppBanner.vue';
import { MnemonicWithExtraWord } from '@enkryptcom/types';
import { computed, PropType } from 'vue';

const props = defineProps({
  hasBack: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  mnemonic: {
    type: Object as PropType<MnemonicWithExtraWord>,
    default: () => ({ mnemonic: '', extraWord: '' }),
  },
});

const words = computed(() =>
  props.mnemonic.mnemonic.split(' ').filter(word => word !== ''),
);
const rows = computed(() => Math.ceil(words.value.length / 2));

const hasExtraWord = computed(() => {
  return props.mnemonic.extraWord && props.mnemonic.extraWord !== '';
});
</script>
