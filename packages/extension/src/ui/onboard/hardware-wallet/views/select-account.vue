<template>
  <div class="flex flex-col gap-2">
    <h1 class="text-heading-2xl mt-3">Select an account</h1>

    <div class="flex flex-col gap-4 py-4">
      <hardware-select-path
        :paths="networkPaths"
        :selected-path="selectedPath"
        @update:selected-path="selectPath"
      />
      <div class="flex flex-col gap-1 my-2">
        <hardware-select-account
          v-for="(account, index) in visibleAccounts"
          :key="index"
          :network="network"
          :selected="account.selected"
          :balance="account.balance"
          :index="account.index"
          :address="account.address"
          :disabled="existingAddresses.includes(account.address)"
          @toggle:select="toggleSelectAccount(account.index)"
        />
      </div>
      <div class="flex items-center justify-between">
        <app-btn
          type="secondary"
          size="small"
          :disabled="currentAddressIndex < ADDRESSES_PER_PAGE || loading"
          @click="loadPrevAccounts"
        >
          <template #leading>
            <app-icon name="chevron-left" size="xxs" />
          </template>
          Previous
        </app-btn>
        <app-btn
          type="secondary"
          size="small"
          :is-loading="loading"
          @click="loadNextAccounts"
        >
          Next
          <template #trailing>
            <app-icon name="chevron-right" size="xxs" />
          </template>
        </app-btn>
      </div>
      <app-btn size="large" :disabled="!enableContinue" @click="continueAction"
        >Continue</app-btn
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import HardwareSelectPath from '../components/hardware-select-path.vue';
import HardwareSelectAccount from '../components/hardware-select-account.vue';
import AppBtn from '@components/buttons/AppBtn.vue';
import AppIcon from '@components/icon/AppIcon.vue';
import { useRoute, useRouter } from 'vue-router';
import { routes } from '../routes';
import { getNetworkByName } from '@/libs/utils/networks';
import { HWWalletAccountType, PathType } from '../types';
import { computed, onMounted, ref } from 'vue';
import { EnkryptAccount, HWwalletType } from '@enkryptcom/types';
import HWwallet from '@enkryptcom/hw-wallets';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import { fromBase } from '@enkryptcom/utils';
import { ProviderName } from '@/types/provider';
import { polkadotEncodeAddress } from '@enkryptcom/utils';
import { useHWStore } from '../store';
import { BaseNetwork } from '@/types/base-network';
import SubstrateAPI from '@/providers/polkadot/libs/api';
import type EvmAPI from '@/providers/ethereum/libs/api';
import type BtcApi from '@/providers/bitcoin/libs/api';
import type SolApi from '@/providers/solana/libs/api';
import type KdaApi from '@/providers/kadena/libs/api';
const store = useHWStore();

const router = useRouter();
const route = useRoute();
const networkName = route.params.network as string;
const walletType = route.params.walletType as HWwalletType;

if (!networkName || !walletType) {
  router.push({ name: routes.addHardwareWallet.name });
}
const network = ref<BaseNetwork | undefined>();
const hwWallet = new HWwallet();
const networkPaths = ref<PathType[]>([]);
const selectedPath = ref<PathType>({ path: '', label: '', basePath: '' });
const ADDRESSES_PER_PAGE = 5;
const loading = ref(false);
const currentAddressIndex = ref(0);
const keyring = new PublicKeyRing();
const existingAccounts = ref<EnkryptAccount[]>([]);
const networkApi = ref<SubstrateAPI | EvmAPI | BtcApi | SolApi | KdaApi>();
const accounts = ref<HWWalletAccountType[]>([]);
const visibleAccounts = computed(() => {
  return accounts.value.slice(
    currentAddressIndex.value - ADDRESSES_PER_PAGE < 0
      ? 0
      : currentAddressIndex.value - ADDRESSES_PER_PAGE + 1,
    currentAddressIndex.value + 1,
  );
});
const enableContinue = computed(() => {
  for (const acc of accounts.value) {
    if (acc.selected) return true;
  }
  return false;
});

onMounted(async () => {
  network.value = (await getNetworkByName(networkName))!;
  networkApi.value = await network.value.api();
  keyring.getAccounts().then(accounts => (existingAccounts.value = accounts));
  networkPaths.value = await hwWallet.getSupportedPaths({
    wallet: walletType,
    networkName: network.value!.name,
  });
  selectedPath.value = networkPaths.value[0];
  loadAddresses(
    currentAddressIndex.value,
    currentAddressIndex.value + ADDRESSES_PER_PAGE,
  );
});

const existingAddresses = computed(() => {
  if (!existingAccounts.value.length) return [];
  return existingAccounts.value.map(acc => acc.address);
});

const loadAddresses = async (start: number, end: number) => {
  loading.value = true;
  for (let i = start; i < end; i++) {
    if (accounts.value[i]) {
      currentAddressIndex.value = i;
      continue;
    }
    const reqPath = selectedPath.value.path.replace('{index}', i.toString());
    const newAddress = await hwWallet.getAddress({
      confirmAddress: false,
      networkName: network.value!.name,
      pathType: selectedPath.value,
      pathIndex: i.toString(),
      wallet: walletType,
    });
    const address =
      network.value!.provider === ProviderName.polkadot
        ? polkadotEncodeAddress(newAddress.address)
        : newAddress.address;
    accounts.value.push({
      address,
      publicKey: newAddress.publicKey,
      balance: '~',
      path: reqPath,
      pathType: selectedPath.value,
      selected: false,
      walletType: walletType,
      index: i,
      name: `${network.value!.name_long} ${walletType} ${i}`,
    });

    networkApi.value!.getBalance(newAddress.address).then(balance => {
      accounts.value[i].balance = formatFloatingPointValue(
        fromBase(balance, network.value!.decimals),
      ).value;
    });

    currentAddressIndex.value = i;
  }
  loading.value = false;
};
const loadNextAccounts = () => {
  if (loading.value) return;
  loadAddresses(
    currentAddressIndex.value + 1,
    currentAddressIndex.value + ADDRESSES_PER_PAGE + 1,
  );
};
const loadPrevAccounts = () => {
  if (loading.value) return;
  if (currentAddressIndex.value > ADDRESSES_PER_PAGE)
    currentAddressIndex.value = currentAddressIndex.value - ADDRESSES_PER_PAGE;
};
const toggleSelectAccount = (idx: number) => {
  accounts.value[idx].selected = !accounts.value[idx].selected;
};
const selectPath = (newPath: PathType) => {
  selectedPath.value = newPath;
  accounts.value = [];
  currentAddressIndex.value = 0;
  loadAddresses(
    currentAddressIndex.value,
    currentAddressIndex.value + ADDRESSES_PER_PAGE,
  );
};

const continueAction = async () => {
  await hwWallet.close();
  store.setSelectedAccounts(accounts.value.filter(acc => acc.selected));
  router.push({
    name: routes.ImportingAccount.name,
    params: {
      walletType,
      network: network.value!.name,
    },
  });
};
</script>
