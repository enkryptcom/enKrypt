<template #content>
  <div
    v-if="walletType === WalletType.trezor"
    class="provider-verify-transaction__block"
  >
    <div class="provider-verify-transaction__hw">
      <trezor-icon />
      <p>
        Before confirming the transaction plug in your Trezor and follow the
        further instructions.
      </p>
    </div>
  </div>
  <div
    v-if="walletType === WalletType.ledger"
    class="provider-verify-transaction__block"
  >
    <div class="provider-verify-transaction__hw">
      <ledger-icon />
      <p>
        Before confirming the transaction plug in your Ledger, select the right
        app and follow the further instructions.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import TrezorIcon from "@action/icons/hardware/trezor-icon.vue";
import LedgerIcon from "@/ui/action/icons/hardware/ledger-icon.vue";
import { PropType } from "vue";
import { WalletType } from "@enkryptcom/types";
defineProps({
  walletType: {
    type: String as PropType<WalletType>,
    default: "",
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "../styles/verify-transaction.less";
</style>
