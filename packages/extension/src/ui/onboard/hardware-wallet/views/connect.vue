<template>
  <div class="connect" :class="{ process: isProcessing || isError }">
    <ledger-logo v-if="walletType === HWwalletType.ledger" />
    <trezor-logo v-if="walletType === HWwalletType.trezor" />
    <h3 v-if="walletType === HWwalletType.ledger">Connect to your Ledger</h3>
    <h3 v-if="walletType === HWwalletType.trezor">Connect to your Trezor</h3>
    <p v-if="walletType === HWwalletType.ledger">
      Connect your wallet to your computer. Unlock your Ledger and open the
      <b>{{ appName }} App.</b>
      <!-- <a href="#">Learn more</a> -->
    </p>
    <p v-if="walletType === HWwalletType.trezor">
      Connect your wallet to your computer. Follow the instructions in the
      Trezor connection tab.
      <!-- <a href="#">Learn more</a> -->
    </p>
    <base-button title="Connect" :click="connectAction" />
  </div>

  <hardware-wallet-process
    v-if="isProcessing"
    :is-ledger="walletType === HWwalletType.ledger"
    :is-connetion="true"
  />
  <hardware-wallet-error
    v-if="isError"
    :is-ledger="walletType === HWwalletType.ledger"
    :app-name="appName"
    :error-message="errorMessage"
    @retry-connection="connectAction"
  />
</template>
<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import LedgerLogo from "@action/icons/hardware/ledger-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import HardwareWalletProcess from "../components/hardware-wallet-process.vue";
import HardwareWalletError from "../components/hardware-wallet-error.vue";
import { useRoute, useRouter } from "vue-router";
import { routes } from "../routes";
import { getNetworkByName } from "@/libs/utils/networks";
import HWwallet, { ledgerAppNames } from "@enkryptcom/hw-wallets";
import { HWwalletType } from "@enkryptcom/types";
import TrezorLogo from "@action/icons/hardware/trezor-logo.vue";
import { BaseNetwork } from "@/types/base-network";

const route = useRoute();
const router = useRouter();
const networkName = route.params.network as keyof typeof ledgerAppNames;
const walletType = route.params.walletType as HWwalletType;

if (!networkName || !walletType) {
  router.push({ name: routes.addHardwareWallet.name });
}

const network = ref<BaseNetwork | undefined>();

const errorMessage = ref<string>("");
const isProcessing = ref(false);
const isError = ref(false);

onBeforeMount(async () => {
  network.value = (await getNetworkByName(networkName as string))!;
});

const appName = computed(() => {
  return ledgerAppNames[networkName] || "";
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

<style lang="less">
@import "~@action/styles/theme.less";

.connect {
  width: 100%;
  position: relative;

  &.process {
    height: 348px;
    overflow: hidden;
  }

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 24px 0 8px 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 24px 0;

    a {
      color: @secondaryLabel;
      display: block;
      margin: 8px 0 0 0;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
