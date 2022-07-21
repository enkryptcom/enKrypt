<template>
  <div class="hardware-wallet-error">
    <import-error-animation />
    <h3 v-if="isLedger">Unable to connect to Ledger</h3>
    <h3 v-else>Unable to connect to Trezor</h3>

    <p>
      {{ errorMessage }}
    </p>
    <base-button title="Retry" :click="() => emit('retryConnection')" />
  </div>
</template>
<script setup lang="ts">
import ImportErrorAnimation from "@action/icons/import/import-error-animation.vue";
import BaseButton from "@action/components/base-button/index.vue";
const emit = defineEmits<{
  (e: "retryConnection"): void;
}>();

defineProps({
  isLedger: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
  appName: {
    type: String,
    default: "",
  },
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-wallet-error {
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

  svg {
    width: 72px;
    height: 72px;
  }
}
</style>
