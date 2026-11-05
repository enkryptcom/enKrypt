<template>
  <div class="relative w-full">
    <div class="flex items-center justify-between gap-3">
      <app-btn-icon
        icon="arrow-left"
        label="Back to hardware wallets"
        @click="backToHardwareRoute"
      />
      <ledger-logo v-if="walletType === HWwalletType.ledger" />
      <trezor-logo v-if="walletType === HWwalletType.trezor" />
    </div>
    <h1
      v-if="walletType === HWwalletType.ledger"
      class="mt-6 mb-4 text-heading-xl text-text-default"
    >
      Connect to your Ledger
    </h1>
    <p
      v-if="walletType === HWwalletType.trezor"
      class="mt-6 mb-2 text-heading-xl text-text-default"
    >
      Connect to your Trezor
    </p>
    <p
      v-if="walletType === HWwalletType.ledger"
      class="mb-6 text-text-base text-text-subtle"
    >
      Connect your wallet to your computer. Unlock your Ledger and open the
      <b>{{ appName }} App.</b>
    </p>
    <p
      v-if="walletType === HWwalletType.trezor"
      class="mb-6 text-text-base text-text-subtle"
    >
      Connect your wallet to your computer. Follow the instructions in the
      Trezor connection tab.
    </p>
    <hardware-wallet-process
      v-if="isProcessing"
      :is-ledger="walletType === HWwalletType.ledger"
      :is-connetion="true"
    />

    <hardware-wallet-error
      v-else-if="isError"
      :is-ledger="walletType === HWwalletType.ledger"
      :app-name="appName"
      :error-message="errorMessage"
      @retry-connection="connectAction"
    />
    <app-btn v-else size="large" @click="connectAction" class="flex w-full"
      >Connect</app-btn
    >
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import LedgerLogo from '@/assets/icons/hardware/ledger-logo.vue';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import AppBtnIcon from '@common/components/buttons/AppBtnIcon.vue';
import HardwareWalletProcess from '../components/hardware-wallet-process.vue';
import HardwareWalletError from '../components/hardware-wallet-error.vue';
import { useRoute, useRouter } from 'vue-router';
import { routes } from '../routes';
import { getNetworkByName } from '@/libs/utils/networks';
import HWwallet, { ledgerAppNames } from '@enkryptcom/hw-wallets';
import { HWwalletType } from '@enkryptcom/types';
import TrezorLogo from '@/assets/icons/hardware/trezor-logo.vue';
import { BaseNetwork } from '@/types/base-network';

const route = useRoute();
const router = useRouter();
const networkName = route.params.network as keyof typeof ledgerAppNames;
const walletType = route.params.walletType as HWwalletType;

if (!networkName || !walletType) {
  router.push({
    name: routes.addHardwareWallet.name,
    query: { network: networkName },
  });
}

const backToHardwareRoute = () => {
  router.push({
    name: routes.addHardwareWallet.name,
    query: { network: networkName },
  });
};

const network = ref<BaseNetwork | undefined>();

const errorMessage = ref<string>('');
const isProcessing = ref(false);
const isError = ref(false);

onBeforeMount(async () => {
  network.value = (await getNetworkByName(networkName as string))!;
});

const appName = computed(() => {
  return ledgerAppNames[networkName] || '';
});
const connectAction = () => {
  const hwwallet = new HWwallet();
  isProcessing.value = true;
  isError.value = false;
  hwwallet
    .isConnected({ wallet: walletType, networkName: network.value!.name })
    .then(() => {
      setTimeout(() => {
        hwwallet.close().then(() => {
          isProcessing.value = false;
          router.push({
            name: routes.SelectAccount.name,
            params: {
              network: network.value!.name,
              walletType,
            },
          });
        });
      }, 1000);
    })
    .catch((e: Error) => {
      isError.value = true;
      isProcessing.value = false;
      errorMessage.value = e.message;
    });
};
</script>
