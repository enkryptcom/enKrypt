<template>
  <div class="import-account-process">
    <import-keystore-animation v-if="isKeystore && !isDone" />
    <import-private-key-animation v-if="isPrivateKey && !isDone" />
    <import-done-animation v-if="isDone" />
    <import-account-animation v-if="!isKeystore && !isPrivateKey && !isDone" />
    <p v-if="isKeystore && !isDone">Importing account from Keystore file</p>
    <p v-if="isPrivateKey && !isDone">Importing account from Private Key</p>
    <p v-if="isDone" class="green">Account imported</p>
    <p v-if="!isKeystore && !isPrivateKey && !isDone">Importing account</p>
  </div>
</template>
<script setup lang="ts">
import ImportKeystoreAnimation from "@action/icons/import/import-keystore-animation.vue";
import ImportPrivateKeyAnimation from "@action/icons/import/import-private-key-animation.vue";
import ImportAccountAnimation from "@action/icons/import/import-account-animation.vue";
import ImportDoneAnimation from "@action/icons/import/import-done-animation.vue";

defineProps({
  isKeystore: {
    type: Boolean,
    default: false,
  },
  isPrivateKey: {
    type: Boolean,
    default: false,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.import-account-process {
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
    margin: 16px 0 0 0;

    &.green {
      font-size: 20px;
      line-height: 28px;
      color: @success;
    }
  }

  svg {
    width: 72px;
    height: 72px;
  }
}
</style>
