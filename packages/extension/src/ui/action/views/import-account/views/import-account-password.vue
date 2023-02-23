<template>
  <import-account-header v-bind="$attrs" :is-back="true" />

  <div class="import-account-password">
    <h2>Enter password</h2>
    <p class="import-account-password__desc">
      Enter password for<br />
      <span>
        {{ fileName }}
      </span>
      to import your wallet.
    </p>

    <base-input
      type="password"
      placeholder="Password"
      class="import-account-password__input"
      :value="keystorePassword"
      :is-error="isDisabled"
      v-bind="$attrs"
      @keyup.enter="unlock"
    />
    <p v-show="error" class="import-account-password__error">
      {{ error }}
    </p>

    <base-button
      title="Import account"
      :click="unlock"
      :disabled="isDisabled || isProcessing"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseInput from "@action/components/base-input/index.vue";
import BaseButton from "@action/components/base-button/index.vue";
import Wallet, { thirdparty } from "ethereumjs-wallet";
import type { KeyringPair$Json } from "@polkadot/keyring/types";
import { BaseNetwork } from "@/types/base-network";
import { ProviderName } from "@/types/provider";
import { getAccountFromJSON } from "@/providers/polkadot/libs/keystore";
import { KeyPairAdd } from "@enkryptcom/types";
import PublicKeyRing from "@/libs/keyring/public-keyring";

const emit = defineEmits<{
  (e: "navigate:importAccount"): void;
  (e: "update:wallet", wallet: KeyPairAdd): void;
}>();

const keyring = new PublicKeyRing();

const error = ref("");

const props = defineProps({
  keystorePassword: {
    type: String,
    default: "",
  },
  fileName: {
    type: String,
    default: "",
  },
  fileJson: {
    type: Object,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});

const isProcessing = ref(false);
const isDisabled = computed(() => {
  return props.keystorePassword.length < 3;
});

const fromMyEtherWalletV2 = (json: any) => {
  if (json.privKey.length !== 64) {
    throw new Error("Invalid private key length");
  }
  const privKey = Buffer.from(json.privKey, "hex");
  return new Wallet(privKey);
};

const getWalletFromPrivKeyFile = (
  jsonfile: any,
  password: string
): Promise<Wallet> => {
  if (jsonfile.encseed != null)
    return Promise.resolve(Wallet.fromEthSale(jsonfile, password));
  else if (jsonfile.Crypto != null || jsonfile.crypto != null) {
    if (jsonfile.Crypto) jsonfile.crypto = jsonfile.Crypto;
    return Wallet.fromV3(jsonfile, password, true);
  } else if (jsonfile.hash != null)
    return Promise.resolve(thirdparty.fromEtherWallet(jsonfile, password));
  else if (jsonfile.publisher == "MyEtherWallet")
    return Promise.resolve(fromMyEtherWalletV2(jsonfile));
  throw new Error("Invalid Wallet file");
};

const unlock = async () => {
  isProcessing.value = true;
  error.value = "";

  if (props.network.provider === ProviderName.ethereum) {
    try {
      const wallet = await getWalletFromPrivKeyFile(
        props.fileJson,
        props.keystorePassword
      );

      const newAddress = `0x${wallet.getAddress().toString("hex")}`;

      if (await keyring.accountAlreadyAdded(newAddress)) {
        error.value = "This account has already been added";
        return;
      }

      emit("update:wallet", {
        privateKey: wallet.getPrivateKeyString(),
        publicKey: wallet.getPublicKeyString(),
        address: wallet.getAddressString(),
        name: "",
        signerType: props.network.signer[0],
      });
    } catch (e) {
      isProcessing.value = false;
      error.value = (e as Error).message;
    }
  } else if (props.network.provider === ProviderName.polkadot) {
    try {
      const account = getAccountFromJSON(
        props.fileJson as KeyringPair$Json,
        props.keystorePassword
      );

      if (await keyring.accountAlreadyAdded(account.address)) {
        error.value = "This account has already been added";
        return;
      }

      emit("update:wallet", account);
    } catch (e: any) {
      isProcessing.value = false;
      error.value = e.message;
    }
  }
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-password {
  width: 100%;

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
    margin: 0 0 24px 0;
    word-break: break-all;

    span {
      font-weight: 500;
    }
  }

  &__input {
    margin: 0 0 24px 0;

    &.error {
      margin: 0 0 8px 0;
    }
  }

  &__error {
    width: 100%;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0 0 24px 0;
  }
}
</style>
