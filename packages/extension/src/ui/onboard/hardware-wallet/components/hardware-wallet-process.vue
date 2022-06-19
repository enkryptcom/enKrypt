<template>
  <div class="hardware-wallet-process">
    <ledger-connection />
    <p>Connecting to your Ledger</p>
  </div>
</template>
<script setup lang="ts">
import LedgerConnection from "@action/icons/hardware/ledger-connection.vue";
</script>

<script lang="ts">
export default {
  name: "HardwareWalletProcess",
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-wallet-process {
  width: calc(~"100% + 112px");
  height: calc(~"100% + 112px");
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  left: -56px;
  top: -56px;
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
}
</style>
