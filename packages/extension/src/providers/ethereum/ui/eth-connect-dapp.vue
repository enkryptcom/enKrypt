<template>
  <common-popup>
    <template #header>
      <sign-logo color="#05C0A5" class="common-popup__logo"></sign-logo>
      <div class="common-popup__network">
        <img :src="defaultNetwork.icon" />
        <p>{{ defaultNetwork.name_long }}</p>
      </div>
    </template>

    <template #content>
      <h2>Connect to Uniswap</h2>

      <div class="common-popup__block no-inset">
        <div class="common-popup__account">
          <img src="@/ui/action/icons/raw/uniswap.png" />
          <div class="common-popup__account-info">
            <h4>Uniswap</h4>
            <p>https://app.uniswap.org/</p>
          </div>
        </div>
      </div>

      <div class="provider-connect-dapp__link">
        <link-icon />
      </div>

      <div class="common-popup__block no-inset no-padding">
        <select-account-input
          :name="accountHeaderData.selectedAccount!.name"
          :address="accountHeaderData.selectedAccount!.address"
          :toggle-accounts="toggleAccounts"
          :network="defaultNetwork"
        ></select-account-input>
      </div>

      <div class="provider-connect-dapp__info">
        <info-icon-gray />
        <p>
          This will reveal your public address, wallet balance and activity to
          app.uniswap.org
        </p>
      </div>

      <modal-accounts
        :show-accounts="showAccounts"
        :close="toggleAccounts"
        :network="defaultNetwork"
        :account-info="accountHeaderData"
        @address-changed="onSelectedAddressChanged"
      ></modal-accounts>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="decline" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Connect" :click="connect" />
    </template>
  </common-popup>

  <dapp-connecting v-if="showProcessing"></dapp-connecting>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import LinkIcon from "@action/icons/connect/link-icon.vue";
import InfoIconGray from "@action/icons/common/info-icon-gray.vue";
import SelectAccountInput from "@action/components/select-account-input/index.vue";
import ModalAccounts from "@action/views/modal-accounts/index.vue";
import DappConnecting from "@action/views/dapp-connecting/index.vue";
import { AccountsHeaderData } from "@action/types/account";
import { EnkryptAccount, SignerType, WalletType } from "@enkryptcom/types";
import { DEFAULT_NETWORK_NAME, getNetworkByName } from "@/libs/utils/networks";
import { BaseNetwork } from "@/types/base-network";

const defaultNetwork = getNetworkByName(DEFAULT_NETWORK_NAME) as BaseNetwork;
const accountHeaderData = ref<AccountsHeaderData>({
  activeAccounts: [
    {
      address: "0x585a4dec422138b7389f6205cb47c52c6278b8d3",
      basePath: "m/44'/60'/0'/0",
      name: "EVM Account 1",
      pathIndex: 0,
      publicKey:
        "0x600744bbdf16e007b3d44e745be5c7f3560de039e113890cb94501cb9db36b9bb36a1856d16f33d423f41b2ab6a6532fd78215f89b405d624fe42c3aab5dad1e",
      signerType: SignerType.secp256k1,
      walletType: WalletType.mnemonic,
      isHardware: false,
    },
    {
      address: "0x99999990d598b918799f38163204bbc30611b6b6",
      basePath: "m/44'/60'/1'/0",
      name: "fake account #1",
      pathIndex: 0,
      publicKey: "0x0",
      signerType: SignerType.secp256k1,
      walletType: WalletType.mnemonic,
      isHardware: false,
    },
    {
      address: "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391",
      basePath: "m/44'/60'/1'/1",
      name: "fake account #3",
      pathIndex: 0,
      publicKey: "0x0",
      signerType: SignerType.secp256k1,
      walletType: WalletType.mnemonic,
      isHardware: false,
    },
  ],
  inactiveAccounts: [],
  selectedAccount: {
    address: "0x99999990d598b918799f38163204bbc30611b6b6",
    basePath: "m/44'/60'/1'/0",
    name: "fake account #1",
    pathIndex: 0,
    publicKey: "0x0",
    signerType: SignerType.secp256k1,
    walletType: WalletType.mnemonic,
    isHardware: false,
  },
  activeBalances: [],
});
const showAccounts = ref(false);
const showProcessing = ref(false);

const decline = () => {
  console.log("decline");
};

const connect = () => {
  showProcessing.value = true;
};

const toggleAccounts = () => {
  showAccounts.value = !showAccounts.value;
};

const onSelectedAddressChanged = async (newAccount: EnkryptAccount) => {
  accountHeaderData.value.selectedAccount = newAccount;
};
</script>

<style lang="less">
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "~@action/styles/provider-connect-dapp.less";
</style>
