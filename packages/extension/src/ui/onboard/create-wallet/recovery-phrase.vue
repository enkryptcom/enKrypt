<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-heading-2xl mt-3">Secret recovery phrase</h1>
    <app-banner-base>
      <template #icon>
        <app-icon
          name="exclamation-triangle"
          variant="filled"
          class="shrink-0 text-text-warning"
        />
      </template>
      This is the recovery phase for your wallet. You and you alone should have
      access to it. It can be used to restore your wallet.<br />
    </app-banner-base>

    <div class="flex flex-col gap-4">
      <ol
        class="grid grid-cols-2 grid-rows-6 grid-flow-col gap-x-4 gap-y-1 rounded-12 border border-border-subtle bg-background-default p-4 select-text"
      >
        <li
          v-for="(word, index) in words"
          :key="index"
          class="flex items-baseline gap-2 text-heading-base font-normal text-text-default"
        >
          <span class="w-6 shrink-0 text-text-sm text-text-subtle">{{
            index + 1
          }}</span>
          {{ word }}
        </li>
      </ol>

      <p class="text-text-sm text-text-subtle">
        Best practices for your recovery phrase are to write it down on paper
        and store it somewhere secure. Resist temptation to email it to yourself
        or screenshot it.
      </p>

      <app-btn size="large" @click="nextAction">Next</app-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import AppBtn from '@common/components/buttons/AppBtn.vue';
import AppBannerBase from '@common/components/banner/AppBannerBase.vue';
import AppIcon from '@common/components/icon/AppIcon.vue';
import { useRouter } from 'vue-router';
import { onMounted, computed, ref } from 'vue';
import { generateMnemonic } from 'bip39';
import { routes } from './routes';
import { useOnboardStore } from './store';

const router = useRouter();
const store = useOnboardStore();

const password = store.password;
const mnemonic = ref('');

const nextAction = () => {
  store.setMnemonic(mnemonic.value);
  router.push({
    name: routes.checkPhrase.name,
  });
};

onMounted(() => {
  createMnemonic();
  checkForPassword();
});

const checkForPassword = () => {
  if (!password) {
    router.push({ path: routes.pickPassword.path });
  }
};

const createMnemonic = () => {
  mnemonic.value = generateMnemonic(128);
};

const words = computed(() => mnemonic.value.split(' '));
</script>
