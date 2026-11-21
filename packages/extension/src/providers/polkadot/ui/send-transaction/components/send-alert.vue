<template>
  <common-send-alert>
    <p v-if="alertType === AlertType.ED_WARN">
      Your balance will go the minimum balance, which will drop your remaining
      balance to 0.<br />
      <a
        target="_blank"
        rel="noreferrer"
        href="https://support.polkadot.network/support/solutions/articles/65000168651-what-is-the-existential-deposit-#:~:text=Print&text=On%20the%20Polkadot%20network%2C%20an,the%20Existential%20Deposit%20(ED)."
        >What is Existential Deposit?</a
      >
    </p>
    <p v-if="alertType === AlertType.DESTINATION_BALANCE">
      Destination address doesnt have minimum balance, please send
      {{ existentialBalance }} before sending any tokens.<br />
    </p>
  </common-send-alert>
</template>

<script setup lang="ts">
import CommonSendAlert from '@/ui/send/send-alert.vue';
import { AlertType } from '../../types';
import { PropType } from 'vue';
defineProps({
  alertType: {
    type: Number as PropType<AlertType>,
    default: () => 0,
  },
  existentialBalance: {
    type: String,
    default: () => '0',
  },
});
</script>
