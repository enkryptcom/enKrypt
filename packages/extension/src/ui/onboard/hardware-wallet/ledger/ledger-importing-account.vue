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
      ></hardware-importing-account>

      <p class="ledger-importing-account__example">
        Example: Private funds, Savings account, dApp account, Work funds,
        Airdrops
      </p>
    </custom-scrollbar>

    <div
      class="ledger-importing-account__buttons"
      :class="{ border: isHasScroll() }"
    >
      <base-button
        title="Add accounts"
        :disabled="!allValid"
        :click="addAction"
      />
    </div>
  </div>
  <hardware-wallet-process
    v-if="isProcessing"
    :is-ledger="true"
  ></hardware-wallet-process>
  <hardware-account-imported v-if="isProcessDone"></hardware-account-imported>
</template>
<script setup lang="ts">
import { ref, ComponentPublicInstance, onMounted } from "vue";
import BaseButton from "@action/components/base-button/index.vue";
import HardwareWalletProcess from "../components/hardware-wallet-process.vue";
import HardwareImportingAccount from "../components/hardware-importing-account.vue";
import HardwareAccountImported from "../components/hardware-account-imported.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { useRoute } from "vue-router";
import { getNetworkByName } from "@/libs/utils/networks";
import { HWWalletAccountType } from "../types";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { computed } from "@vue/reactivity";

const route = useRoute();

const networkName = route.params.networkName as string;
const selectedAccounts = ref(
  JSON.parse(route.params.selectedAccounts as string) as HWWalletAccountType[]
);
const network = getNetworkByName(networkName)!;
const keyring = new PublicKeyRing();
const existingNames = ref<string[]>([]);
const isProcessing = ref(false);
const isProcessDone = ref(false);

const importingAccountScrollRef = ref<ComponentPublicInstance<HTMLElement>>();

defineExpose({ importingAccountScrollRef });

onMounted(() => {
  keyring
    .getAccounts()
    .then(
      (accounts) => (existingNames.value = accounts.map((acc) => acc.name))
    );
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
const addAction = () => {
  isProcessing.value = true;

  setTimeout(() => {
    isProcessing.value = false;
    isProcessDone.value = true;
  }, 2000);
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
