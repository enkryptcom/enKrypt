<template>
  <div class="ledger-connect" :class="{ process: isProcessing || isError }">
    <ledger-logo />
    <h3>Connect to your Ledger</h3>
    <p>
      Connect your wallet to your computer. Unlock your Ledger and open the
      <b>{{ appName }} App.</b><a href="#">Learn more</a>
    </p>

    <base-button title="Connect" :click="connectAction" />
  </div>

  <hardware-wallet-process
    v-if="isProcessing"
    :is-ledger="true"
    :is-connetion="true"
  ></hardware-wallet-process>
  <hardware-wallet-error
    v-if="isError"
    :is-ledger="true"
    :app-name="appName"
    :error-message="errorMessage"
    @retry-connection="connectAction"
  ></hardware-wallet-error>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import LedgerLogo from "@action/icons/hardware/ledger-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import HardwareWalletProcess from "../components/hardware-wallet-process.vue";
import HardwareWalletError from "../components/hardware-wallet-error.vue";
import { useRoute, useRouter } from "vue-router";
import { routes } from "../routes";
import { getNetworkByName } from "@/libs/utils/networks";
import HWwallet, { ledgerAppNames } from "@enkryptcom/hw-wallets";
import { HWwalletNames } from "@enkryptcom/types";

const route = useRoute();
const networkName = route.params.network as keyof typeof ledgerAppNames;
const network = getNetworkByName(networkName as string)!;
const router = useRouter();

const errorMessage = ref<string>("");
const isProcessing = ref(false);
const isError = ref(false);

const appName = computed(() => {
  return ledgerAppNames[networkName] || "";
});
const connectAction = () => {
  const hwwallet = new HWwallet();
  isProcessing.value = true;
  isError.value = false;
  hwwallet
    .isConnected({ wallet: HWwalletNames.ledger, networkName: network.name })
    .then(() => {
      isProcessing.value = false;
      router.push({
        name: routes.ledgerSelectAccount.name,
        params: {
          networkName: network.name,
        },
      });
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

.ledger-connect {
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
