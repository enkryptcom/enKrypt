<template>
  <div class="add-hardware-wallet">
    <hardware-icon />
    <h3>Add hardware wallet account</h3>
    <p>Select a hardware wallet you'd like to use with Enkrypt.</p>

    <router-link
      v-if="isLedgerSupported"
      :to="{
        name: routes.Connect.name,
        params: {
          network: route.query.network as string,
          walletType: HWwalletType.ledger,
        },
      }"
      class="add-hardware-wallet__button"
    >
      <ledger-logo />
      <right-arrow />
    </router-link>
    <router-link
      v-if="isTrezorSupported"
      :to="{
        name: routes.Connect.name,
        params: {
          network: route.query.network as string,
          walletType: HWwalletType.trezor,
        },
      }"
      class="add-hardware-wallet__button"
    >
      <trezor-logo />
      <right-arrow />
    </router-link>
  </div>
</template>
<script setup lang="ts">
import HardwareIcon from "@action/icons/hardware/hardware-icon.vue";
import LedgerLogo from "@action/icons/hardware/ledger-logo.vue";
import TrezorLogo from "@action/icons/hardware/trezor-logo.vue";
import RightArrow from "@action/icons/common/right-arrow.vue";
import { routes } from "./routes";
import { useRoute } from "vue-router";
import { HWwalletType, NetworkNames } from "@enkryptcom/types";
import HWwallets from "@enkryptcom/hw-wallets";
import { ref } from "vue";
const hwWallet = new HWwallets();
const isLedgerSupported = ref(false);
const isTrezorSupported = ref(false);
const route = useRoute();

hwWallet
  .getSupportedPaths({
    wallet: HWwalletType.ledger,
    networkName: route.query.network as NetworkNames,
  })
  .then((paths) => {
    if (paths) isLedgerSupported.value = !process.env.IS_FIREFOX;
  })
  .catch(() => ({}));
hwWallet
  .getSupportedPaths({
    wallet: HWwalletType.trezor,
    networkName: route.query.network as NetworkNames,
  })
  .then((paths) => {
    if (paths) isTrezorSupported.value = true;
  })
  .catch(() => ({}));
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.add-hardware-wallet {
  width: 100%;

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
  }

  &__button {
    width: 100%;
    height: 64px;
    border: 1px solid rgba(95, 99, 104, 0.2);
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    padding: 15px 12px 15px 20px;
    box-sizing: border-box;
    text-decoration: none;
    cursor: pointer;
    margin: 0 0 12px 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black004;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
