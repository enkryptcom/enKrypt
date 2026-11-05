<template>
  <div class="flex flex-col gap-2">
    <hardware-icon class="text-icon-default" />
    <h1 class="text-heading-2xl mt-3">Add hardware wallet account</h1>
    <p class="text-text-sm text-text-subtle">
      Select a hardware wallet you'd like to use with MEW extension.
    </p>

    <div class="flex flex-col gap-3 py-4">
      <router-link
        v-for="wallet in wallets"
        :key="wallet.type"
        :to="{
          name: routes.Connect.name,
          params: {
            network: route.query.network as string,
            walletType: wallet.type,
          },
        }"
        :aria-label="wallet.label"
        class="flex h-16 w-full items-center justify-between rounded-12 py-4 pr-3 pl-5 text-text-default inset-ring inset-ring-border-default transition-colors hover:bg-background-default-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <component :is="wallet.logo" />
        <app-icon name="chevron-right" class="text-icon-default" />
      </router-link>
      <p
        v-if="isChecked && !wallets.length"
        class="text-text-sm text-text-subtle"
      >
        No supported hardware wallets for this network.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import HardwareIcon from '@/assets/icons/hardware/hardware-icon.vue';
import LedgerLogo from '@/assets/icons/hardware/ledger-logo.vue';
import TrezorLogo from '@/assets/icons/hardware/trezor-logo.vue';
import AppIcon from '@components/icon/AppIcon.vue';
import { routes } from './routes';
import { useRoute } from 'vue-router';
import { HWwalletType, NetworkNames } from '@enkryptcom/types';
import HWwallets from '@enkryptcom/hw-wallets';
import { computed, ref } from 'vue';
const hwWallet = new HWwallets();
const isLedgerSupported = ref(false);
const isTrezorSupported = ref(false);
const isChecked = ref(false);
const route = useRoute();

const ledgerCheck = hwWallet
  .getSupportedPaths({
    wallet: HWwalletType.ledger,
    networkName: route.query.network as NetworkNames,
  })
  .then(paths => {
    if (paths) isLedgerSupported.value = !__IS_FIREFOX__;
  })
  .catch(() => ({}));
const trezorCheck = hwWallet
  .getSupportedPaths({
    wallet: HWwalletType.trezor,
    networkName: route.query.network as NetworkNames,
  })
  .then(paths => {
    if (paths) isTrezorSupported.value = true;
  })
  .catch(() => ({}));
// Hold the empty state until both checks settle, so it doesn't flash
Promise.allSettled([ledgerCheck, trezorCheck]).then(() => {
  isChecked.value = true;
});

const wallets = computed(() => [
  ...(isLedgerSupported.value
    ? [{ type: HWwalletType.ledger, label: 'Ledger', logo: LedgerLogo }]
    : []),
  ...(isTrezorSupported.value
    ? [{ type: HWwalletType.trezor, label: 'Trezor', logo: TrezorLogo }]
    : []),
]);
</script>
