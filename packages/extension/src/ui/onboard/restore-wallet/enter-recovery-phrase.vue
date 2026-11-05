<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-heading-2xl mt-3">Enter your<br />recovery phrase</h1>
    <p class="text-text-sm text-text-subtle">
      You can use 12, 15, 18, 21 or 24 words phrase to restore your wallet. Just
      enter as many words as you have in your phrase.
    </p>

    <app-text-area
      v-model="mnemonic"
      label="Your recovery phrase"
      autocomplete="off"
      spellcheck="false"
    />

    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <p id="extra-word-label" class="text-text-sm text-text-default">
          Do you have extra word?
        </p>
        <p class="ml-auto text-text-sm text-text-subtle">
          {{ extraWordToggleString }}
        </p>
        <app-toggle v-model="hasExtraWord" aria-labelledby="extra-word-label" />
      </div>
      <app-input
        v-if="hasExtraWord"
        v-model="extraWord"
        label="Extra word"
        placeholder="Enter extra word"
      />
    </div>

    <app-btn class="mt-3" size="large" :disabled="!validate" @click="nextAction"
      >Next</app-btn
    >
  </div>
</template>
<script setup lang="ts">
import AppBtn from '@common/components/buttons/AppBtn.vue';
import AppInput from '@common/components/input/AppInput.vue';
import AppTextArea from '@components/text_area/AppTextArea.vue';
import AppToggle from '@common/components/buttons/AppToggle.vue';
import { useRouter } from 'vue-router';
import { validateMnemonic } from 'bip39';
import { ref, computed } from 'vue';
import { routes } from './routes';
import { useRestoreStore } from './store';

const store = useRestoreStore();
const mnemonic = ref('');
const router = useRouter();

/** -------------------
 * Extra Word
 * ------------------- */
const extraWord = ref<string | undefined>('');
const hasExtraWord = ref(false);

const extraWordToggleString = computed(() =>
  hasExtraWord.value ? 'Yes' : 'No',
);

/** -------------------
 * Methods
 * ------------------- */
const nextAction = () => {
  store.setMnemonic(formattedMnemonic.value);
  if (hasExtraWord.value && extraWord.value && extraWord.value !== '') {
    store.setExtraWord(extraWord.value);
    extraWord.value = '';
  }
  mnemonic.value = '';
  router.push({
    name: routes.pickPassword.name,
  });
};

const formattedMnemonic = computed(() => {
  const words = mnemonic.value.match(/\b(\w+)\b/g);
  if (!words) return '';
  return words.join(' ');
});
const validate = computed(() => {
  return validateMnemonic(formattedMnemonic.value);
});
</script>
