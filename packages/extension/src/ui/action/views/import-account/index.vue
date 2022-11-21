<template>
  <div class="import-account__container">
    <div class="import-account__overlay" @click="close()" />
    <div class="import-account__wrap">
      <!-- Ethereum ecosystem  -->
      <import-account-start
        v-if="isStart"
        :network="network"
        @select:keystore="keystoreFileAction"
        @select:privkey="privateKeyAction"
        @close="close"
      />

      <import-account-keystore-file
        v-if="isKeystoreFile"
        :is-error="inputFileError"
        @update:select-file="fileSelected"
        @close="close"
        @back="startAction"
      />

      <import-account-password
        v-if="isEnterPassword"
        :keystore-password="keystorePassword"
        :is-error="keystorePassError"
        :file-name="keystoreFile?.name || ''"
        :file-json="keystoreJSON"
        :network="network"
        @navigate:import-account="importingAccountAction"
        @update:wallet="walletUpdate"
        @update:value="updateKeystorePassword"
        @close="close"
        @back="keystoreFileAction"
      />

      <import-account-importing
        v-if="isImportingAccount"
        :network="network"
        :keypair="keyPair"
        :is-keystore="isKeyStoreImport"
        :is-priv-key="isPrivKeyImport"
        v-bind="$attrs"
        @close="close"
        @back="enterPasswordAction"
      />

      <import-account-private-key
        v-if="isPrivateKey"
        :network="network"
        @update:wallet="walletUpdate"
        @close="close"
        @back="startAction"
      />

      <!-- Polkadot ecosystem  -->

      <!-- <import-account-start-dot
        v-if="isStart && isDot"
        :to-select-account="selectAccountAction"
        @close="close"
      ></import-account-start-dot>

      <import-account-select-account-dot
        v-if="iSelectAccount && isDot"
        @close="close"
        @back="startAction"
      ></import-account-select-account-dot> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import ImportAccountStart from "./views/import-account-start.vue";
import ImportAccountKeystoreFile from "./views/import-account-keystore-file.vue";
import ImportAccountPassword from "./views/import-account-password.vue";
import ImportAccountImporting from "./views/import-account-importing.vue";
import ImportAccountPrivateKey from "./views/import-account-private-key.vue";
// import ImportAccountStartDot from "./views/import-account-start-dot.vue";
// import ImportAccountSelectAccountDot from "./views/import-account-select-account-dot.vue";
import { BaseNetwork } from "@/types/base-network";
import { KeyPairAdd, SignerType } from "@enkryptcom/types";

const isStart = ref(true);
const isKeystoreFile = ref(false);
const isPrivateKey = ref(false);
const isEnterPassword = ref(false);
const isImportingAccount = ref(false);
const iSelectAccount = ref(false);
const inputFileError = ref(false);
const keystorePassword = ref("");
const keystorePassError = ref(false);
const keystoreFile = ref<File>();
const keystoreJSON = ref({});
const keyPair = ref<KeyPairAdd>({
  address: "",
  privateKey: "",
  publicKey: "",
  name: "",
  signerType: SignerType.secp256k1,
});
const emit = defineEmits<{
  (e: "close"): void;
}>();

defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});
const isPrivKeyImport = ref(false);
const isKeyStoreImport = ref(false);

const allVars = [
  isStart,
  isKeystoreFile,
  isPrivateKey,
  isEnterPassword,
  isImportingAccount,
  iSelectAccount,
];

const close = () => {
  emit("close");
};

const startAction = () => {
  allVars.forEach((val) => (val.value = false));
  isStart.value = true;
};

const keystoreFileAction = () => {
  allVars.forEach((val) => (val.value = false));
  isKeystoreFile.value = true;
  isKeyStoreImport.value = true;
  isPrivKeyImport.value = false;
};

const privateKeyAction = () => {
  allVars.forEach((val) => (val.value = false));
  isPrivateKey.value = true;
  isKeyStoreImport.value = false;
  isPrivKeyImport.value = true;
};

const enterPasswordAction = () => {
  allVars.forEach((val) => (val.value = false));
  isEnterPassword.value = true;
};

const importingAccountAction = () => {
  allVars.forEach((val) => (val.value = false));
  isImportingAccount.value = true;
};

// const selectAccountAction = () => {
//   allVars.forEach((val) => (val.value = false));
//   iSelectAccount.value = true;
// };
const updateKeystorePassword = (password: string) => {
  keystorePassword.value = password;
};
const fileSelected = (file: File) => {
  const reader = new FileReader();
  reader.addEventListener("load", (event) => {
    try {
      keystoreJSON.value = JSON.parse(event.target!.result as string);
      inputFileError.value = false;
      keystoreFile.value = file;
      enterPasswordAction();
    } catch (e) {
      inputFileError.value = true;
    }
  });
  reader.readAsBinaryString(file);
};

const walletUpdate = (wallet: KeyPairAdd) => {
  keyPair.value = wallet;
  importingAccountAction();
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
    left: -340px;
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
