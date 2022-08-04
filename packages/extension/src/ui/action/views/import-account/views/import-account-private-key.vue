<template>
  <import-account-header
    v-bind="$attrs"
    :is-back="true"
  ></import-account-header>

  <div class="import-account-private-key" :class="{ process: isProcessing }">
    <h2>Import account with Private Key</h2>
    <p class="import-account-private-key__desc">
      Enter your private key string here
    </p>

    <textarea
      v-model="privKey"
      autocomplete="off"
      class="import-account-private-key__input"
      :class="{ error: !isValidKey }"
      placeholder="Private key"
      autofocus
    >
    </textarea>

    <base-button
      title="Import account"
      :click="importAction"
      :disabled="!isValidKey"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseButton from "@action/components/base-button/index.vue";
import Wallet from "ethereumjs-wallet";
import { hexToBuffer } from "@enkryptcom/utils";
import { KeyPairAdd, SignerType } from "@enkryptcom/types";

const isProcessing = ref(false);
const privKey = ref("");

const emit = defineEmits<{
  (e: "update:wallet", keypair: KeyPairAdd): void;
}>();

const isValidKey = computed(() => {
  try {
    const buffer = hexToBuffer(privKey.value);
    new Wallet(buffer);
    return true;
  } catch (e) {
    return false;
  }
});
const importAction = () => {
  const buffer = hexToBuffer(privKey.value);
  const wallet = new Wallet(buffer);
  emit("update:wallet", {
    privateKey: wallet.getPrivateKeyString(),
    publicKey: wallet.getPublicKeyString(),
    address: wallet.getAddressString(),
    name: "",
    signerType: SignerType.secp256k1,
  });
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-private-key {
  width: 100%;

  &.process {
    height: 228px;
    overflow: hidden;
  }

  h2 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 24px 0;
  }

  &__desc {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 8px 0;
  }

  &__input {
    width: 100%;
    height: 62px;
    background: @white;
    font-family: "Roboto";
    box-sizing: border-box;
    border-radius: 10px;
    margin-bottom: 24px;
    resize: none;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: @primaryLabel;
    outline: none !important;
    padding: 10px 12px;
    border: 2px solid @primary;
    &.error {
      border: 2px solid @error;
      line-height: 38px;
    }
    &:active,
    &:focus {
      height: 64px;
    }
  }
}
</style>
