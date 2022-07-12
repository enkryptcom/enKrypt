<template>
  <div class="import-account__container">
    <div class="import-account__overlay" @click="close()"></div>
    <div class="import-account__wrap">
      <!-- Ethereum ecosystem  -->
      <import-account-start
        v-if="isStart && !isDot"
        @select:keystore="keystoreFileAction"
        @select:privkey="privateKeyAction"
        @close="close"
      ></import-account-start>

      <import-account-keystore-file
        v-if="isKeystoreFile && !isDot"
        @update:select-file="fileSelected"
        @close="close"
        @back="startAction"
      ></import-account-keystore-file>

      <import-account-password
        v-if="isEnterPassword && !isDot"
        :to-import-account="importingAccountAction"
        @close="close"
        @back="keystoreFileAction"
      ></import-account-password>

      <import-account-importing
        v-if="isImportingAccount && !isDot"
        @close="close"
        @back="enterPasswordAction"
      ></import-account-importing>

      <import-account-private-key
        v-if="isPrivateKey && !isDot"
        @close="close"
        @back="startAction"
      ></import-account-private-key>

      <!-- Polkadot ecosystem  -->

      <import-account-start-dot
        v-if="isStart && isDot"
        :to-select-account="selectAccountAction"
        @close="close"
      ></import-account-start-dot>

      <import-account-select-account-dot
        v-if="iSelectAccount && isDot"
        @close="close"
        @back="startAction"
      ></import-account-select-account-dot>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "ImportAccount",
};
</script>

<script setup lang="ts">
import { ref, PropType } from "vue";
import ImportAccountStart from "./views/import-account-start.vue";
import ImportAccountKeystoreFile from "./views/import-account-keystore-file.vue";
import ImportAccountPassword from "./views/import-account-password.vue";
import ImportAccountImporting from "./views/import-account-importing.vue";
import ImportAccountPrivateKey from "./views/import-account-private-key.vue";
import ImportAccountStartDot from "./views/import-account-start-dot.vue";
import ImportAccountSelectAccountDot from "./views/import-account-select-account-dot.vue";

const isStart = ref(true);
const isKeystoreFile = ref(false);
const isPrivateKey = ref(false);
const isEnterPassword = ref(false);
const isImportingAccount = ref(false);
const iSelectAccount = ref(false);

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  isDot: {
    type: Boolean,
    default: false,
  },
});

const allVars = [
  isStart,
  isKeystoreFile,
  isPrivateKey,
  isEnterPassword,
  isImportingAccount,
  iSelectAccount,
];

const startAction = () => {
  allVars.forEach((val) => (val.value = false));
  isStart.value = true;
};

const keystoreFileAction = () => {
  allVars.forEach((val) => (val.value = false));
  isKeystoreFile.value = true;
};

const privateKeyAction = () => {
  allVars.forEach((val) => (val.value = false));
  isPrivateKey.value = true;
};

const enterPasswordAction = () => {
  allVars.forEach((val) => (val.value = false));
  isEnterPassword.value = true;
};

const importingAccountAction = () => {
  allVars.forEach((val) => (val.value = false));
  isImportingAccount.value = true;
};

const selectAccountAction = () => {
  allVars.forEach((val) => (val.value = false));
  iSelectAccount.value = true;
};

const fileSelected = (file: File) => {
  console.log(file);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 460px;
    height: auto;
    z-index: 107;
    position: relative;
    height: auto;
    overflow-x: hidden;
    padding: 0 56px 56px 56px;
  }

  &__container {
    width: 800px;
    height: 600px;
    left: 0px;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }
}
</style>
