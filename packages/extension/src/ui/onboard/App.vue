<template>
  <div
    class="relative flex w-screen h-screen flex-col gap-5 items-center justify-center bg-background-default p-5 overflow-auto"
  >
    <div
      class="rounded-2xl bg-background-alternative p-5 sm:p-7 w-full sm:max-w-[480px] sm:min-h-[600px] mx-auto"
      :class="wrapClassObject()"
    >
      <div v-if="isShowBackButton()" class="flex items-center justify-between">
        <app-btn-icon @click="router.go(-1)" icon="arrow-left" label="back" />
        <img :src="appLogo" class="max-h-7" />
      </div>

      <router-view class="mb-5 flex flex-col w-full" />
    </div>

    <footer
      class="flex flex-col items-center gap-1 w-full sm:max-w-[480px] mx-auto text-center text-text-xs text-text-muted"
    >
      <p>
        By continuing, I agree to the
        <a
          href="https://www.myetherwallet.com/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-brand hover:underline"
          >Terms of Service</a
        >
      </p>
      <p>&copy; {{ currentYear }} MyEtherWallet. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import appLogo from '@/assets/images/logo.svg';
import AppBtnIcon from '@common/components/buttons/AppBtnIcon.vue';
import ExtensionIcon from '@action/icons/tip/extension-icon.vue';
import OnlineIcon from '@action/icons/tip/online-icon.vue';
import PinIcon from '@action/icons/tip/pin-icon.vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isGeoRestricted } from '@/libs/utils/screening';
import { OnboardRouteName, OnboardRoutePath } from './route-enums';

const route = useRoute();
const router = useRouter();
const currentYear = new Date().getFullYear();

onMounted(async () => {
  isGeoRestricted().then(restricted => {
    if (restricted) {
      window.open(
        'https://help.myetherwallet.com/en/articles/12897302-geographic-restrictions-for-mew',
        '_blank',
        'noopener',
      );
      window.close();
    }
  });
});
const isShowBackButton = () => {
  return (
    route.name &&
    route.name !== OnboardRouteName.NewWallet &&
    route.name !== OnboardRouteName.UserAnalytics &&
    route.name !== OnboardRouteName.CreateWalletReady &&
    route.name !== OnboardRouteName.RestoreWalletReady &&
    route.name !== OnboardRouteName.RestoreWalletBackupDetected &&
    !String(route.name).startsWith('hardware-wallet-')
  );
};

const wrapClassObject = () => {
  return {
    'onboard__wrap--ready':
      route.name === OnboardRouteName.CreateWalletReady ||
      route.name === OnboardRouteName.RestoreWalletReady ||
      route.name === OnboardRouteName.RestoreWalletBackupDetected,
    'onboard__wrap--auto-height': route.path.startsWith(
      OnboardRoutePath.HardwareWalletRoot,
    ),
  };
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  font-family: 'DM Sans', sans-serif;
  overflow-y: auto;
}
</style>
