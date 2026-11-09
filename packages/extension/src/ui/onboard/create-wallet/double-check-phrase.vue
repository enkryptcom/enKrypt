<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-heading-2xl mt-3">Let's double check it</h1>

    <div
      v-for="(item, itemIdx) in phraseItems"
      :key="itemIdx"
      class="flex flex-col gap-2"
    >
      <p class="text-text-sm text-text-subtle">
        Select word #{{ item.id + 1 }}
      </p>
      <div class="grid grid-cols-3 gap-2" role="group">
        <app-btn
          v-for="(word, wordIdx) in item.items"
          :key="wordIdx"
          size="medium"
          :type="selection[itemIdx] === wordIdx ? 'primary' : 'secondary'"
          :aria-pressed="selection[itemIdx] === wordIdx"
          @click="selection[itemIdx] = wordIdx"
          >{{ word }}</app-btn
        >
      </div>
    </div>

    <app-btn
      class="mt-2"
      size="large"
      :disabled="!isValid"
      :is-loading="isInitializing"
      @click="nextAction"
      >Next</app-btn
    >
  </div>
</template>
<script setup lang="ts">
import AppBtn from '@common/components/buttons/AppBtn.vue';
import { routes } from './routes';
import { useOnboardStore } from './store';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { chunk, shuffle, sample } from 'lodash';
import { onboardInitializeWallets } from '@/libs/utils/initialize-wallet';

const router = useRouter();
const store = useOnboardStore();
const phrase = store.mnemonic;
const password = store.password;
let phraseArr: string[] = [];
if (!phrase) {
  router.push({ path: routes.pickPassword.path });
} else {
  phraseArr = phrase.split(' ');
}
const shuffledArr = shuffle(phraseArr);
const chunkedArr = chunk(shuffledArr, 3);
const phraseItems: { id: number; items: string[]; validIndex: number }[] = [];
// Picked word index per group; -1 = nothing picked yet
const selection = ref<number[]>(chunkedArr.map(() => -1));
const isInitializing = ref(false);
const isValid = computed(() =>
  phraseItems.every((item, idx) => selection.value[idx] === item.validIndex),
);

chunkedArr.forEach(chunk => {
  const randWord = sample(chunk) || '';
  phraseItems.push({
    id: phraseArr.findIndex(p => p === randWord),
    items: chunk,
    validIndex: chunk.findIndex(p => p === randWord),
  });
});
const nextAction = () => {
  if (!isValid.value || isInitializing.value) return;
  isInitializing.value = true;
  onboardInitializeWallets({
    mnemonic: phrase,
    password,
  }).then(() => {
    isInitializing.value = false;
    router.push({ name: routes.walletReady.name });
  });
};
</script>
