<template>
  <div
    class="relative flex flex-col gap-2"
    :class="{ 'min-h-[348px]': isProcessing || isProcessDone }"
  >
    <template v-if="!isProcessing && !isProcessDone">
      <h1 class="text-heading-2xl mt-3">Name imported account</h1>
      <p class="text-text-sm text-text-subtle">
        Name your account something that makes sense to you! Main account, dapp
        account, yolo account, etc.
      </p>

      <div class="flex flex-col gap-4 divide-y-1 divide-border-default py-4">
        <hardware-importing-account
          v-for="(account, index) in selectedAccounts"
          :key="index"
          :address="account.address"
          :balance="account.balance"
          :network="network"
          :index="account.index"
          :name-value="account.name"
          :is-error="isInvalidName(account.name)"
          @update:value="nameChanged(index, $event)"
        />

        <app-btn size="large" :disabled="!allValid" @click="addAccounts"
          >Add accounts</app-btn
        >
      </div>
    </template>

    <hardware-wallet-process v-if="isProcessing" :is-ledger="true" />
    <hardware-account-imported v-if="isProcessDone" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppBtn from '@components/buttons/AppBtn.vue';
import HardwareWalletProcess from '../components/hardware-wallet-process.vue';
import HardwareImportingAccount from '../components/hardware-importing-account.vue';
import HardwareAccountImported from '../components/hardware-account-imported.vue';
import { useRoute, useRouter } from 'vue-router';
import { getNetworkByName } from '@/libs/utils/networks';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import KeyRingBase from '@/libs/keyring/keyring';
import { computed } from 'vue';
import {
  EnkryptAccount,
  HWwalletType,
  SignerType,
  WalletType,
} from '@enkryptcom/types';
import { routes } from '../routes';
import { ProviderName } from '@/types/provider';
import { useHWStore } from '../store';
import { BaseNetwork } from '@/types/base-network';
const store = useHWStore();

const route = useRoute();
const router = useRouter();
const networkName = route.params.network as string;
const selectedAccounts = ref(store.selectedAccounts);
const walletType = route.params.walletType as HWwalletType;

if (!networkName || !walletType || !selectedAccounts.value.length) {
  router.push({ name: routes.addHardwareWallet.name });
}
const network = ref<BaseNetwork | undefined>();
const keyring = new PublicKeyRing();
const keyringBase = new KeyRingBase();
const existingAccounts = ref<EnkryptAccount[]>([]);
const isProcessing = ref(false);
const isProcessDone = ref(false);

onMounted(async () => {
  network.value = (await getNetworkByName(networkName))!;
  keyring.getAccounts().then(accounts => (existingAccounts.value = accounts));
});
const existingNames = computed(() => {
  if (!existingAccounts.value.length) return [];
  return existingAccounts.value.map(acc => acc.name);
});

const allValid = computed(() => {
  for (const acc of selectedAccounts.value) {
    if (isInvalidName(acc.name)) return false;
  }
  return true;
});
const isInvalidName = (name: string) => {
  return (
    existingNames.value.includes(name) ||
    selectedAccounts.value.reduce((total, acc) => {
      if (acc.name === name) return total + 1;
      return total;
    }, 0) > 1
  );
};
const nameChanged = (idx: number, val: string) => {
  selectedAccounts.value[idx].name = val;
};
const addAccounts = async () => {
  isProcessing.value = true;
  for (const acc of selectedAccounts.value) {
    await keyringBase.addHWAccount({
      HWOptions: {
        networkName: network.value!.name,
        pathTemplate: acc.pathType.path,
      },
      address: acc.address,
      basePath: acc.pathType.basePath,
      name: acc.name,
      pathIndex: acc.index,
      publicKey: acc.publicKey,
      signerType:
        network.value!.provider === ProviderName.polkadot
          ? SignerType.ed25519
          : network.value!.signer[0],
      walletType: walletType as unknown as WalletType,
    });
  }
  isProcessing.value = false;
  isProcessDone.value = true;
};
</script>
