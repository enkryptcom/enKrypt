<template>
  <import-account-header
    v-bind="$attrs"
    :is-back="true"
  ></import-account-header>

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
    <p v-show="error" class="import-account-password__error">{{ error }}</p>

    <base-button
      title="Import account"
      :click="unlock"
      :disabled="isDisabled || isProcessing"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseInput from "@action/components/base-input/index.vue";
import BaseButton from "@action/components/base-button/index.vue";
import Wallet, { thirdparty } from "ethereumjs-wallet";

const emit = defineEmits<{
  (e: "navigate:importAccount"): void;
  (e: "update:wallet", wallet: Wallet): void;
}>();

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
  else if (jsonfile.Crypto != null || jsonfile.crypto != null)
    return Wallet.fromV3(jsonfile, password, true);
  else if (jsonfile.hash != null)
    return Promise.resolve(thirdparty.fromEtherWallet(jsonfile, password));
  else if (jsonfile.publisher == "MyEtherWallet")
    return Promise.resolve(fromMyEtherWalletV2(jsonfile));
  throw new Error("Invalid Wallet file");
};

const unlock = () => {
  isProcessing.value = true;
  getWalletFromPrivKeyFile(props.fileJson, props.keystorePassword)
    .then((wallet: Wallet) => {
      isProcessing.value = false;
      emit("update:wallet", wallet);
    })
    .catch((e) => {
      isProcessing.value = false;
      error.value = e.message;
    });
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
