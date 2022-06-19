<template>
  <div class="hardware-wallet-error">
    <connection-error />
    <h3>Unable to connect to Ledger</h3>
    <p>
      Make sure it is unlocked, not used in another site, and Ethereum app was
      opened after unlock.
    </p>
    <base-button title="Retry" :click="retryAction" />
  </div>
</template>
<script setup lang="ts">
import ConnectionError from "@action/icons/hardware/connection-error.vue";
import BaseButton from "@action/components/base-button/index.vue";

const props = defineProps({
  retry: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const retryAction = () => {
  props.retry();
};
</script>

<script lang="ts">
export default {
  name: "HardwareWalletError",
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-wallet-error {
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
  padding: 56px;
  box-sizing: border-box;

  h3 {
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 28px;
    text-align: center;
    letter-spacing: 0.15px;
    color: @error;
    margin: 24px 0 0 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    text-align: center;
    margin: 8px 0 24px 0;
  }
}
</style>
