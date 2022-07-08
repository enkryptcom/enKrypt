<template>
  <div class="hardware-wallet-process">
    <ledger-connection v-if="isLedger" />
    <trezor-connection v-else />
    <p v-if="isLedger && isConnetion">Connecting to your Ledger</p>
    <p v-if="!isLedger && isConnetion">Connecting to your Trezor</p>
    <p v-if="!isConnetion">Importing account</p>
  </div>
</template>
<script setup lang="ts">
import LedgerConnection from "@action/icons/hardware/ledger-connection.vue";
import TrezorConnection from "@action/icons/hardware/trezor-connection.vue";

defineProps({
  isLedger: {
    type: Boolean,
    default: false,
  },
  isConnetion: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-wallet-process {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  background-color: @white;

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 24px 0 0 0;
  }

  svg {
    width: 72px;
    height: 72px;
  }
}
</style>
