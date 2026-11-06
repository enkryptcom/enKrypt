<template>
  <div class="flex flex-col gap-6">
    <img :src="appLogo" class="h-10 mr-auto" alt="MEW" />

    <div class="flex flex-col gap-2">
      <h1 class="text-heading-2xl text-text-default">Your wallet is ready!</h1>
      <p class="text-text-base text-text-subtle">
        Pin the extension to your toolbar so it's always one click away.
      </p>
    </div>

    <section
      class="flex flex-col gap-4 rounded-16 border border-border-subtle bg-background-default p-5"
    >
      <h2 class="text-heading-base text-text-default">Pin MEW extension</h2>
      <ol class="flex flex-col gap-3">
        <li class="flex items-center gap-3">
          <span
            class="flex size-6 shrink-0 items-center justify-center rounded-full bg-background-brand-subtle text-label-xs text-text-brand"
            >1</span
          >
          <span class="text-text-sm text-text-default">
            Click
            <span
              class="mx-0.5 inline-flex pb-1 size-6 items-center justify-center rounded-4 bg-background-alternative align-middle"
              ><extension-icon
            /></span>
            in your browser toolbar
          </span>
        </li>
        <li class="flex items-center gap-3">
          <span
            class="flex size-6 shrink-0 items-center justify-center rounded-full bg-background-brand-subtle text-label-xs text-text-brand"
            >2</span
          >
          <span class="text-text-sm text-text-default">
            Find MEW and click
            <span
              class="mx-0.5 inline-flex size-6 items-center justify-center rounded-4 bg-background-alternative align-middle"
              ><pin-icon
            /></span>
            to pin it
          </span>
        </li>
      </ol>
    </section>

    <div class="flex items-center justify-between gap-4">
      <p class="text-label-sm text-text-subtle">Follow us</p>
      <div class="flex items-center gap-2">
        <a
          v-for="social in SOCIALS"
          :key="social.label"
          :href="social.href"
          :aria-label="social.label"
          target="_blank"
          rel="noopener noreferrer"
          class="flex size-10 items-center justify-center rounded-full border border-border-subtle bg-background-default text-icon-default transition-colors hover:bg-background-default-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <component :is="social.icon" />
        </a>
      </div>
    </div>

    <div class="flex flex-col items-center gap-3">
      <app-btn class="w-full" size="large" @click="finishAction"
        >Finish</app-btn
      >
      <a
        href="https://blog.enkrypt.com/getting-started-with-enkrypt-wallet/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-label-sm text-text-brand hover:underline"
        >How to get started →</a
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import appLogo from '@/assets/images/logo.svg';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import GithubIcon from '@/assets/icons/social/github-icon.vue';
import InstagramIcon from '@/assets/icons/social/instagram-icon.vue';
import RedditIcon from '@/assets/icons/social/reddit-icon.vue';
import TwitterIcon from '@/assets/icons/social/twitter-icon.vue';
import ExtensionIcon from '@action/icons/tip/extension-icon.vue';
import PinIcon from '@action/icons/tip/pin-icon.vue';
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
