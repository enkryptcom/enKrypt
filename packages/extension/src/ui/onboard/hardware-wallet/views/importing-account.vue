<template>
  <div
    class="ledger-importing-account"
    :class="{ process: isProcessing || isProcessDone }"
  >
    <custom-scrollbar
      ref="importingAccountScrollRef"
      class="ledger-importing-account__scroll-area"
    >
      <h3>Importing account</h3>
      <p class="ledger-importing-account__text">
        You can rename your account or continue with a default name.
      </p>

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

      <p class="ledger-importing-account__example">
        Name your account something that makes sense to you! Main account, dapp
        account, yolo account, etc.
      </p>
    </custom-scrollbar>

    <div
      class="ledger-importing-account__buttons"
      :class="{ border: isHasScroll() }"
    >
      <base-button
        title="Add accounts"
        :disabled="!allValid"
        :click="addAccounts"
      />
    </div>
  </div>
  <hardware-wallet-process v-if="isProcessing" :is-ledger="true" />
  <hardware-account-imported v-if="isProcessDone" />
</template>
<script setup lang="ts">
import { ref, ComponentPublicInstance, onMounted } from "vue";
import BaseButton from "@action/components/base-button/index.vue";
import HardwareWalletProcess from "../components/hardware-wallet-process.vue";
import HardwareImportingAccount from "../components/hardware-importing-account.vue";
import HardwareAccountImported from "../components/hardware-account-imported.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { useRoute, useRouter } from "vue-router";
import { getNetworkByName } from "@/libs/utils/networks";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import KeyRingBase from "@/libs/keyring/keyring";
import { computed } from "@vue/reactivity";
import {
  EnkryptAccount,
  HWwalletType,
  SignerType,
  WalletType,
} from "@enkryptcom/types";
import { routes } from "../routes";
import { ProviderName } from "@/types/provider";
import { useHWStore } from "../store";
import { BaseNetwork } from "@/types/base-network";
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

const importingAccountScrollRef = ref<ComponentPublicInstance<HTMLElement>>();

defineExpose({ importingAccountScrollRef });

onMounted(async () => {
  network.value = (await getNetworkByName(networkName))!;
  keyring.getAccounts().then((accounts) => (existingAccounts.value = accounts));
});
const existingNames = computed(() => {
  if (!existingAccounts.value.length) return [];
  return existingAccounts.value.map((acc) => acc.name);
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
const isHasScroll = () => {
  if (importingAccountScrollRef.value) {
    return importingAccountScrollRef.value.$el.classList.contains(
      "ps--active-y"
    );
  }

  return false;
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

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.ledger-importing-account {
  width: 100%;
  position: relative;
  padding-bottom: 32px;

  &.process {
    height: 348px;
    overflow: hidden;
    padding: 0;
  }

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
  }

  &__text {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 16px 0;
  }

  &__example {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @tertiaryLabel;
    margin: 0 0 16px 0;
  }

  &__buttons {
    padding: 24px 56px;
    width: 460px;
    height: 88px;
    position: absolute;
    box-sizing: border-box;
    left: -56px;
    bottom: -56px;
    background: @white;

    &.border {
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: calc(~"100% + 53px");
    height: 456px;
    margin: 0;
    padding: 0 53px 0 0 !important;
    margin-right: -53px;
    box-sizing: border-box;

    &.ps--active-y {
      padding-bottom: 0 !important;
    }

    & > .ps__rail-y {
      right: 0 !important;
    }
  }
}
</style>
