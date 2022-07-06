<template>
  <div class="trezor-connect" :class="{ process: isProcessing || isError }">
    <trezor-logo />
    <h3>Connect to your Trezor</h3>
    <p>
      Connect your wallet to your computer. Follow the instructions in the
      Trezor connection tab. <a href="#">Learn more</a>
    </p>

    <base-button title="Connect" :click="connectAction" />
  </div>

  <hardware-wallet-process
    v-if="isProcessing"
    :is-ledger="false"
    :is-connetion="true"
  ></hardware-wallet-process>
  <hardware-wallet-error
    v-if="isError"
    :retry="tryAgainAction"
  ></hardware-wallet-error>
</template>
<script setup lang="ts">
import { ref } from "vue";
import TrezorLogo from "@action/icons/hardware/trezor-logo.vue";
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
    router.push({ path: routes.trezorSelectAccount.path });
  }, 2000);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.trezor-connect {
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
