<template>
  <import-account-header v-bind="$attrs" :is-back="true" />

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
      @keyup.enter="importAction"
    >
    </textarea>

    <p class="import-account-private-key__already_exists">
      {{ accountAlreadyExists ? "This account has already been added" : "" }}
    </p>

    <base-button
      title="Import account"
      :click="importAction"
      :disabled="!isValidKey"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from "vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseButton from "@action/components/base-button/index.vue";
import Wallet from "ethereumjs-wallet";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { KeyPairAdd, SignerType } from "@enkryptcom/types";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { BaseNetwork } from "@/types/base-network";
import { decode as wifDecode } from "wif";
import { ProviderName } from "@/types/provider";
import { getPublicKey } from "@noble/secp256k1";

const isProcessing = ref(false);
const privKey = ref("");
const keyring = new PublicKeyRing();

const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (e: "update:wallet", keypair: KeyPairAdd): void;
}>();

const accountAlreadyExists = ref(false);

const formattedPrivateKey = computed(() => privKey.value.trim());

const isValidKey = computed(() => {
  try {
    if (props.network.provider === ProviderName.ethereum) {
      const buffer = hexToBuffer(formattedPrivateKey.value);
      new Wallet(buffer);
      return true;
    } else if (props.network.provider === ProviderName.bitcoin) {
      wifDecode(formattedPrivateKey.value);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
});

const onInput = () => {
  accountAlreadyExists.value = false;
};

const importAction = async () => {
  if (props.network.provider === ProviderName.ethereum) {
    const buffer = hexToBuffer(formattedPrivateKey.value);
    const wallet = new Wallet(buffer);
    const newAddress = `0x${wallet.getAddress().toString("hex")}`;

    if (await keyring.accountAlreadyAdded(newAddress)) {
      accountAlreadyExists.value = true;
      return;
    }

    emit("update:wallet", {
      privateKey: wallet.getPrivateKeyString(),
      publicKey: wallet.getPublicKeyString(),
      address: wallet.getAddressString(),
      name: "",
      signerType: SignerType.secp256k1,
    });
  } else if (props.network.provider === ProviderName.bitcoin) {
    const decoded = wifDecode(formattedPrivateKey.value);
    emit("update:wallet", {
      privateKey: bufferToHex(decoded.privateKey),
      publicKey: bufferToHex(getPublicKey(decoded.privateKey)),
      address: bufferToHex(getPublicKey(decoded.privateKey, true)),
      name: "",
      signerType: SignerType.secp256k1btc,
    });
  }
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
    height: auto;
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
