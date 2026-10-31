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

    <div
      v-if="
        route.name === OnboardRouteName.CreateWalletReady ||
        route.name === OnboardRouteName.RestoreWalletReady
      "
      class="onboard__info"
    >
      <h4>Pin the Enkrypt extension</h4>
      <p>Click on <extension-icon /> in your browser</p>
      <p>
        Find <online-icon class="onboard__online" /> Enkrypt and click
        <pin-icon /> to pin it
      </p>
    </div>
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

<style lang="less">
// @import '@action/styles/theme.less';
@import (css)
  url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  font-family: 'DM Sans', sans-serif;
  overflow-y: auto;
}

// .onboard {
//   &__logo {
//     position: absolute;
//     left: 32px;
//     top: 24px;
//   }

//   &__back {
//     position: absolute;
//     top: 8px;
//     left: 8px;
//     border-radius: 8px;
//     cursor: pointer;
//     padding: 8px;
//     transition: background 300ms ease-in-out;

//     &:hover {
//       background: @black007;
//     }
//   }

//   &__wrap {
//     width: 460px;
//     height: 650px;
//     // background: @white;
//     box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
//     border-radius: 12px;
//     padding: 56px;
//     box-sizing: border-box;
//     position: relative;
//     display: flex;
//     flex-direction: row;
//     align-items: center;
//     justify-content: flex-start;
//     overflow: hidden;

//     &--ready {
//       background: transparent;
//       box-shadow: none;
//     }

//     &--auto-height {
//       height: auto;
//       max-height: 600px;
//     }
//   }

//   &__info {
//     position: absolute;
//     right: 8px;
//     top: 8px;
//     background: @tip;
//     border: 1px solid rgba(0, 0, 0, 0.1);
//     width: 301px;
//     height: 96px;
//     border-radius: 10px;
//     padding: 12px 20px;
//     box-sizing: border-box;

//     h4 {
//       font-style: normal;
//       font-weight: 500;
//       font-size: 16px;
//       line-height: 24px;
//       color: @primaryLabel;
//       margin: 0;
//     }

//     p {
//       font-style: normal;
//       font-weight: 400;
//       font-size: 16px;
//       line-height: 24px;
//       color: @black07;
//       margin: 0;
//     }
//   }

//   &__online {
//     width: 16px;
//     height: 16px;
//   }
// }
</style>
