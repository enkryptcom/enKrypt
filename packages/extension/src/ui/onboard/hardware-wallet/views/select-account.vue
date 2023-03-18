<template>
  <div class="ledger-select-account">
    <h3>Select an account</h3>
    <hardware-select-path
      :paths="networkPaths"
      :selected-path="selectedPath"
      @update:selected-path="selectPath"
    />
    <div class="ledger-select-account__list">
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
    <div class="ledger-select-account__controls">
      <a
        class="prev"
        :class="{ disable: currentAddressIndex < ADDRESSES_PER_PAGE }"
        @click="loadPrevAccounts"
        ><arrow-prev />Previous</a
      >
      <a @click="loadNextAccounts">Next<arrow-next /></a>
    </div>
    <base-button
      :disabled="!enableContinue"
      class="ledger-select-account__button"
      title="Continue"
      :click="continueAction"
    />
  </div>
</template>
<script setup lang="ts">
import HardwareSelectPath from "../components/hardware-select-path.vue";
import HardwareSelectAccount from "../components/hardware-select-account.vue";
import BaseButton from "@action/components/base-button/index.vue";
import ArrowNext from "@action/icons/common/arrow-next.vue";
import ArrowPrev from "@action/icons/common/arrow-prev.vue";
import { useRoute, useRouter } from "vue-router";
import { routes } from "../routes";
import { getNetworkByName } from "@/libs/utils/networks";
import { HWWalletAccountType, PathType } from "../types";
import { computed, onMounted, ref } from "vue";
import { EnkryptAccount, HWwalletType } from "@enkryptcom/types";
import HWwallet from "@enkryptcom/hw-wallets";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import { fromBase } from "@enkryptcom/utils";
import { ProviderName } from "@/types/provider";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { useHWStore } from "../store";
import { BaseNetwork } from "@/types/base-network";
import SubstrateAPI from "@/providers/polkadot/libs/api";
import EvmAPI from "@/providers/ethereum/libs/api";
import BtcApi from "@/providers/bitcoin/libs/api";
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
const selectedPath = ref<PathType>({ path: "", label: "", basePath: "" });
const ADDRESSES_PER_PAGE = 5;
const loading = ref(false);
const currentAddressIndex = ref(0);
const keyring = new PublicKeyRing();
const existingAccounts = ref<EnkryptAccount[]>([]);
const networkApi = ref<SubstrateAPI | EvmAPI | BtcApi>();
const accounts = ref<HWWalletAccountType[]>([]);
const visibleAccounts = computed(() => {
  return accounts.value.slice(
    currentAddressIndex.value - ADDRESSES_PER_PAGE < 0
      ? 0
      : currentAddressIndex.value - ADDRESSES_PER_PAGE + 1,
    currentAddressIndex.value + 1
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
  keyring.getAccounts().then((accounts) => (existingAccounts.value = accounts));
  networkPaths.value = await hwWallet.getSupportedPaths({
    wallet: walletType,
    networkName: network.value!.name,
  });
  selectedPath.value = networkPaths.value[0];
  loadAddresses(
    currentAddressIndex.value,
    currentAddressIndex.value + ADDRESSES_PER_PAGE
  );
});

const existingAddresses = computed(() => {
  if (!existingAccounts.value.length) return [];
  return existingAccounts.value.map((acc) => acc.address);
});

const loadAddresses = async (start: number, end: number) => {
  loading.value = true;
  for (let i = start; i < end; i++) {
    if (accounts.value[i]) {
      currentAddressIndex.value = i;
      continue;
    }
    const reqPath = selectedPath.value.path.replace("{index}", i.toString());
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
      balance: "~",
      path: reqPath,
      pathType: selectedPath.value,
      selected: false,
      walletType: walletType,
      index: i,
      name: `${network.value!.name_long} ${walletType} ${i}`,
    });

    networkApi.value!.getBalance(newAddress.address).then((balance) => {
      accounts.value[i].balance = formatFloatingPointValue(
        fromBase(balance, network.value!.decimals)
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
    currentAddressIndex.value + ADDRESSES_PER_PAGE + 1
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
    currentAddressIndex.value + ADDRESSES_PER_PAGE
  );
};

const continueAction = async () => {
  await hwWallet.close();
  store.setSelectedAccounts(accounts.value.filter((acc) => acc.selected));
  router.push({
    name: routes.ImportingAccount.name,
    params: {
      walletType,
      network: network.value!.name,
    },
  });
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.ledger-select-account {
  width: 100%;
  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }
  &__list {
    font-size: 0;
    margin: 0 0 16px 0;
  }
  &__controls {
    margin: 0 0 32px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    a {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 4px 4px 4px 8px;
      height: 24px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 6px;
      text-decoration: none;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.8px;
      color: @primaryLabel;
      cursor: pointer;
      transition: opacity 300ms ease-in-out;
      opacity: 1;

      &:hover {
        opacity: 0.8;
      }
      &.disable {
        opacity: 0.2;
      }

      svg {
        margin-left: 4px;
      }

      &.prev {
        padding: 4px 8px 4px 4px;

        svg {
          margin-right: 4px;
          margin-left: 0;
        }
      }
    }
  }

  &__button {
    margin-bottom: -32px;
  }
}
</style>
