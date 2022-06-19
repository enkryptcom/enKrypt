<template>
  <div class="ledger-connect">
    <ledger-logo />
    <h3>Connect to your Ledger</h3>
    <p>
      Connect your wallet to your computer. Unlock your Ledger and open the
      <b>Ethereum app.</b><a href="#">Learn more</a>
    </p>

    <base-button title="Connect" :click="connectAction" />

    <hardware-wallet-process v-if="isProcessing"></hardware-wallet-process>
    <hardware-wallet-error
      v-if="isError"
      :retry="tryAgainAction"
    ></hardware-wallet-error>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import LedgerLogo from "@action/icons/hardware/ledger-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import HardwareWalletProcess from "../components/hardware-wallet-process.vue";
import HardwareWalletError from "../components/hardware-wallet-error.vue";
import { useRouter } from "vue-router";
import { routes } from "../routes";

const router = useRouter();

let isProcessing = ref(false);
let isError = ref(false);

const connectAction = () => {
  isProcessing.value = true;

  setTimeout(() => {
    isProcessing.value = false;
    isError.value = true;
  }, 2000);
};

const tryAgainAction = () => {
  isProcessing.value = true;
  isError.value = false;

  setTimeout(() => {
    router.push({ path: routes.ledgerSelectAccount.path });
  }, 2000);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.ledger-connect {
  width: 100%;
  position: relative;

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
