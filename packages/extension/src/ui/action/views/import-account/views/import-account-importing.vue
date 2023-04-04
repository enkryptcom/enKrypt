<template>
  <import-account-header v-bind="$attrs" :is-back="true" />

  <div class="import-account-importing" :class="{ process: isProcessing }">
    <h2>Importing account</h2>
    <p class="import-account-importing__info">
      You can rename your account or continue with a default name.
    </p>

    <hardware-importing-account
      :no-index="true"
      :network="network"
      :address="keypair.address"
      :index="0"
      :balance="balance"
      :name-value="nameValue"
      :is-error="isNameTaken"
      @update:value="nameUpdated"
    />

    <p class="import-account-importing__example">
      Name your account something that makes sense to you! Main account, dapp
      account, yolo account, etc.
    </p>

    <h4>Enter Extension password</h4>

    <base-input
      type="password"
      placeholder="Extension Password"
      class="import-account-importing__input"
      :value="keyringPassword"
      @update:value="updateKeyringPassword"
    />

    <p v-show="keyringError" class="import-account-importing__error">
      Invalid Keyring password
    </p>

    <base-button
      title="Import account"
      :click="importAction"
      :disabled="isNameTaken || isDisabled"
    />
  </div>

  <import-account-process
    v-if="isProcessing"
    :is-keystore="isKeystore"
    :is-private-key="isPrivKey"
    :is-done="isDone"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref } from "vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseButton from "@action/components/base-button/index.vue";
import HardwareImportingAccount from "@/ui/onboard/hardware-wallet/components/hardware-importing-account.vue";
import ImportAccountProcess from "../components/import-account-process.vue";
import { BaseNetwork } from "@/types/base-network";
import API from "@/providers/ethereum/libs/api";
import { EnkryptAccount, KeyPairAdd } from "@enkryptcom/types";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import { fromBase } from "@enkryptcom/utils";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import KeyRingBase from "@/libs/keyring/keyring";
import BaseInput from "@action/components/base-input/index.vue";
import { sendToBackgroundFromAction } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";

const isProcessing = ref(false);
const isDone = ref(false);
const balance = ref("0.00");
const nodeAPI = ref<API>();
const pubKeyRing = new PublicKeyRing();
const keyringBase = new KeyRingBase();
const allAccounts = ref<EnkryptAccount[]>([]);
const nameValue = ref("");
const keyringError = ref(false);
const keyringPassword = ref("");

const emit = defineEmits<{
  (e: "update:init"): void;
}>();

const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  keypair: {
    type: Object as PropType<KeyPairAdd>,
    default: () => ({}),
  },
  isPrivKey: Boolean,
  isKeystore: Boolean,
});
const isDisabled = computed(() => {
  return keyringPassword.value.length < 3;
});
const isNameTaken = computed(() => {
  if (nameValue.value === "") return true;
  return allAccounts.value.map((acc) => acc.name).includes(nameValue.value);
});
onMounted(() => {
  nameValue.value = props.keypair.name || "My private account";
  props.network.api().then((api) => {
    nodeAPI.value = api as API;
    updateBalance();
  });
  pubKeyRing.getAccounts().then((accounts) => (allAccounts.value = accounts));
});
const updateBalance = async () => {
  nodeAPI.value
    ?.getBalance(props.keypair.address!)
    .then(
      (bal) =>
        (balance.value = formatFloatingPointValue(
          fromBase(bal, props.network.decimals)
        ).value)
    );
};
const nameUpdated = (name: string) => {
  nameValue.value = name;
};

const importAction = async () => {
  isProcessing.value = true;
  keyringBase
    .unlock(keyringPassword.value)
    .then(() => {
      keyringBase
        .addKeyPair(
          {
            address: props.keypair.address!,
            name: nameValue.value,
            privateKey: props.keypair.privateKey,
            publicKey: props.keypair.publicKey,
            signerType: props.keypair.signerType,
          },
          keyringPassword.value
        )
        .then(() => {
          emit("update:init");
          sendToBackgroundFromAction({
            message: JSON.stringify({
              method: InternalMethods.unlock,
              params: [keyringPassword.value],
            }),
          }); // needed to reinitialize background keyring with new vals
          isDone.value = true;
        });
    })
    .catch(() => {
      isProcessing.value = false;
      keyringError.value = true;
    });
};

const updateKeyringPassword = (password: string) => {
  keyringPassword.value = password;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-importing {
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
    margin: 0 0 8px 0;
  }

  &__info {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    margin: 0 0 16px 0;
    color: @secondaryLabel;
  }

  &__example {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @tertiaryLabel;
    margin: 0 0 16px 0;
  }

  h4 {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
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
