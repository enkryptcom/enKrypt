<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <div class="send-transaction__header">
        <h3>Send</h3>
        <a class="send-transaction__close" @click="close">
          <close-icon />
        </a>
      </div>

      <send-address-input
        :input="inputAddress"
        :toggle-select="toggleSelectContact"
        :value="address"
        :identicon="identicon"
      ></send-address-input>

      <send-contacts-list
        :show-accounts="isOpenSelectContact"
        :close="toggleSelectContact"
        :select-account="selectAccount"
        :active-network="activeNetwork"
        :accounts="accounts"
        :identicon="identicon"
      ></send-contacts-list>

      <send-token-select
        :token="selectedToken"
        :toggle-select="toggleSelectToken"
        :api="api"
        :active-account="activeAccount"
      ></send-token-select>

      <send-token-list
        :show-tokens="isOpenSelectToken"
        :close="toggleSelectToken"
        :select-token="selectToken"
        :active-account="activeAccount"
        :api="api"
        :assets="assets"
      >
      </send-token-list>

      <send-input-amount
        :input="inputAmount"
        :value="amount"
      ></send-input-amount>

      <send-fee-select
        :fee="fee"
        :toggle-select="toggleSelectFee"
      ></send-fee-select>

      <transaction-fee-view
        :show-fees="isOpenSelectFee"
        :close="toggleSelectFee"
        :select-fee="() => null"
        :selected="6"
      ></transaction-fee-view>

      <send-alert></send-alert>

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :gray="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle()"
            :click="sendAction"
            :disabled="isDisabled()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendTransaction",
};
</script>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import SendTokenSelect from "./components/send-token-select.vue";
import SendTokenList from "./components/send-token-list.vue";
import SendInputAmount from "./components/send-input-amount.vue";
import SendFeeSelect from "./components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import SendAlert from "./components/send-alert.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { recommendedFee } from "@action/types/mock";
import DomainState from "@/libs/domain-state";
import { BaseNetwork } from "@/types/base-network";
import { getNetworkByName } from "@/libs/utils/networks";
import { BaseToken } from "@/types/base-token";
import EvmAPI from "@/providers/ethereum/libs/api";
import { ApiPromise } from "@polkadot/api";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { Account } from "@action/types/account";
import BigNumber from "bignumber.js";

const route = useRoute();
const router = useRouter();
const domainState = new DomainState();
const keyRing = new PublicKeyRing();

const isOpenSelectContact = ref(false);
const address = ref("");
const isOpenSelectToken = ref(false);
const selectedToken = ref<BaseToken | undefined>();
const amount = ref(0);
const isOpenSelectFee = ref(false);
const fee = ref(recommendedFee);

const activeAccount = ref<string | undefined>();
const activeNetwork = ref<BaseNetwork | undefined>();
const accounts = ref<Account[]>([]);
const identicon = ref<((address: string) => string) | undefined>();
const assets = ref<BaseToken[]>([]);
const api = ref<EvmAPI | ApiPromise>();
const txFee = ref<string | null>(null);

const selected: string = route.params.id as string;

onBeforeMount(async () => {
  const address = await domainState.getSelectedAddress();
  const activeNetworkName = await domainState.getSelectedNetWork();
  const network = getNetworkByName(activeNetworkName ?? "");

  console.log(activeNetworkName, address);

  if (network) {
    activeNetwork.value = network;
    identicon.value = network.identicon;
    assets.value = network.getAllTokens();
    selectedToken.value = assets.value[0];

    if (address) {
      activeAccount.value = network.displayAddress(address);
      console.log("test");

      accounts.value = (await keyRing.getAccounts(network.signer))
        .filter((account) => account.address !== address)
        .map((account) => {
          return {
            name: account.name,
            address: network.displayAddress(account.address),
            amount: 0,
            primaryToken: {
              name: "",
              symbol: "",
              icon: "",
              amount: 0,
              price: 0,
            },
          };
        });

      console.log(accounts.value);
    }

    const networkApi = await network.api();

    await networkApi.init();

    api.value = networkApi.api;
  }
});

watch([selectedToken, amount, address, activeNetwork], async () => {
  if (
    selectedToken.value &&
    amount.value &&
    address.value &&
    activeNetwork.value
  ) {
    console.log(selectedToken.value, amount.value, address.value);
    const tx = await selectedToken.value.send(
      api.value,
      address.value,
      Number(amount.value)
    );
    const { partialFee } = (await tx.paymentInfo(activeAccount.value)).toJSON();

    txFee.value = new BigNumber(partialFee)
      .div(new BigNumber(10 ** activeNetwork.value?.decimals))
      .toString();
  }
});

const close = () => {
  router.go(-1);
};

const inputAddress = (text: string) => {
  address.value = text;
};

const toggleSelectContact = (open: boolean) => {
  isOpenSelectContact.value = open;
};

const toggleSelectToken = (open: boolean) => {
  isOpenSelectToken.value = open;
};

const selectAccount = (account: Account) => {
  address.value = account.address;
  isOpenSelectContact.value = false;
};

const selectToken = (token: BaseToken) => {
  selectedToken.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (number: number) => {
  amount.value = number;
};

const toggleSelectFee = (open: boolean) => {
  isOpenSelectFee.value = open;
};

const sendButtonTitle = () => {
  let title = "Send";

  if (amount.value > 0)
    title = `Send ${amount.value} ${
      selectedToken.value ? selectedToken.value.symbol.toUpperCase() : ""
    }`;

  return title;
};

const isDisabled = () => {
  let isDisabled = true;

  if (amount.value > 0) isDisabled = false;

  return isDisabled;
};

const sendAction = () => {
  router.push({ name: "verify-transaction", params: { id: selected } });
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;
}

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 24px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background: @black007;
    }
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 32px 32px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;

    &-cancel {
      width: 170px;
    }

    &-send {
      width: 218px;
    }
  }
}
</style>
