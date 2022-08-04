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
      @change="onInput"
    >
    </textarea>
    <p class="import-account-private-key__already_exists">
      {{
        accountAlreadyExists ? "The account is already in the extension" : ""
      }}
    </p>

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
import PublicKeyRing from "@/libs/keyring/public-keyring";

const isProcessing = ref(false);
const privKey = ref("");
const keyring = new PublicKeyRing();

const emit = defineEmits<{
  (e: "update:wallet", wallet: Wallet): void;
}>();

const accountAlreadyExists = ref(false);

const formattedPrivateKey = computed(() => privKey.value.trim());

const isValidKey = computed(() => {
  try {
    const buffer = hexToBuffer(formattedPrivateKey.value);
    new Wallet(buffer);
    return true;
  } catch (e) {
    return false;
  }
});

const onInput = () => {
  accountAlreadyExists.value = false;
};

const importAction = async () => {
  const buffer = hexToBuffer(formattedPrivateKey.value);
  const wallet = new Wallet(buffer);
  const newAddress = `0x${wallet.getAddress().toString("hex")}`.toLowerCase();

  const allAccounts = await keyring.getAccounts();

  let alreadyExists = false;

  for (const account of allAccounts) {
    if (account.address.toLowerCase() === newAddress) {
      alreadyExists = true;
      break;
    }
  }

  if (alreadyExists) {
    accountAlreadyExists.value = alreadyExists;
    return;
  }
  emit("update:wallet", wallet);
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
    margin-bottom: 8px;
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

  &__already_exists {
    color: @error;
    height: 14px;
    text-align: left;
    margin: 0px;
    margin-bottom: 16px;
  }
}
</style>
