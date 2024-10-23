<template>
  <div class="send-alert">
    <alert-icon />
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
  </div>
</template>

<script setup lang="ts">
import AlertIcon from '@action/icons/send/alert-icon.vue';
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

<style lang="less">
@import '@action/styles/theme.less';

.send-alert {
  margin: 0 32px 8px 32px;
  background: @error01;
  border-radius: 10px;
  padding: 12px 16px 12px 57px;
  position: relative;
  box-sizing: border-box;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    margin-top: -12px;
  }

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0;

    a {
      color: @error;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
