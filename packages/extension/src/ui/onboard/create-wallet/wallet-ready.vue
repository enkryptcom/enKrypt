<template>
  <div class="flex flex-col gap-4">
    <img :src="appLogo" class="h-12 mr-auto" />
    <h1 class="text-heading-2xl mt-3">Your wallet is ready</h1>

    <div class="flex flex-col gap-2">
      <p class="text-text-sm text-text-subtle">Follow us</p>
      <div class="flex items-center gap-6">
        <a
          v-for="social in SOCIALS"
          :key="social.label"
          :href="social.href"
          :aria-label="social.label"
          target="_blank"
          rel="noopener noreferrer"
          class="block rounded-8 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <component :is="social.icon" />
        </a>
      </div>
    </div>

    <app-btn class="mt-2" size="large" @click="finishAction">Finish</app-btn>
    <a
      href="https://blog.enkrypt.com/getting-started-with-enkrypt-wallet/"
      target="_blank"
      rel="noopener noreferrer"
      class="self-center text-label-base text-text-brand hover:underline"
      >How to get started 👉</a
    >
  </div>
</template>
<script setup lang="ts">
import appLogo from '@/assets/images/logo.svg';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import GithubIcon from '@/assets/icons/social/github-icon.vue';
import InstagramIcon from '@/assets/icons/social/instagram-icon.vue';
import RedditIcon from '@/assets/icons/social/reddit-icon.vue';
import TwitterIcon from '@/assets/icons/social/twitter-icon.vue';
import { useRestoreStore } from '../restore-wallet/store';
import { useOnboardStore } from './store';
import { onMounted } from 'vue';

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/myetherwallet',
    icon: GithubIcon,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/myetherwallet/',
    icon: InstagramIcon,
  },
  {
    label: 'Reddit',
    href: 'https://www.reddit.com/r/MyEtherWallet/',
    icon: RedditIcon,
  },
  { label: 'X', href: 'https://twitter.com/myetherwallet', icon: TwitterIcon },
];

const onboardStore = useOnboardStore();
const restoreStore = useRestoreStore();

// Overwrite the string with random data before setting empty
const secureClear = (value: string) => {
  const array = new Uint8Array(value.length);
  crypto.getRandomValues(array);
  const random = String.fromCharCode(...array);
  value = random;
  value = '';
  return value;
};

onMounted(() => {
  onboardStore.setPassword(secureClear(onboardStore.password));
  onboardStore.setMnemonic(secureClear(onboardStore.mnemonic));
  restoreStore.setMnemonic(secureClear(onboardStore.mnemonic));
  restoreStore.setPassword(secureClear(onboardStore.password));
  restoreStore.setExtraWord(secureClear(restoreStore.extraWord));
});

const finishAction = () => {
  window.close();
};
</script>
