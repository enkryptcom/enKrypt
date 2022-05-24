<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <send-header
        :close="close"
        :toggle-type="toggleSelector"
        :is-send-token="isSendToken"
      ></send-header>
      <send-address-input
        :input="inputAddress"
        :toggle-select="toggleSelectContact"
        :value="address"
      ></send-address-input>

      <send-contacts-list
        :show-accounts="isOpenSelectContact"
        :close="toggleSelectContact"
        :select-account="selectAccount"
        :address="address"
      ></send-contacts-list>

      <send-token-select
        v-if="isSendToken"
        :token="selectedToken"
        :toggle-select="toggleSelectToken"
      ></send-token-select>

      <assets-select-list
        v-show="isOpenSelectToken"
        :close="toggleSelectToken"
        :select-token="selectToken"
        :is-send="true"
      ></assets-select-list>

      <send-nft-select
        v-if="!isSendToken"
        :item="selectedNft"
        :toggle-select="toggleSelectNft"
      ></send-nft-select>

      <nft-select-list
        v-show="isOpenSelectNft"
        :close="toggleSelectNft"
        :select-item="selectItem"
      ></nft-select-list>

      <send-input-amount
        v-if="isSendToken"
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
        :select-fee="selectFee"
        :selected="fee.price.speed"
        :is-header="true"
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
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SendHeader from "./components/send-header.vue";
import SendAddressInput from "./components/send-address-input.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import AssetsSelectList from "@action/views/assets-select-list/index.vue";
import NftSelectList from "@action/views/nft-select-list/index.vue";
import SendTokenSelect from "./components/send-token-select.vue";
import SendNftSelect from "./components/send-nft-select.vue";
import SendInputAmount from "./components/send-input-amount.vue";
import SendFeeSelect from "./components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import SendAlert from "./components/send-alert.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { Account } from "@action/types/account";
import { Token } from "@action/types/token";
import { NFTItem } from "@action/types/nft";
import { TransactionFee } from "@action/types/fee";
import { ethereum, recommendedFee, nft } from "@action/types/mock";

const route = useRoute();
const router = useRouter();

let isOpenSelectContact = ref(false);
let address = ref("");
let isOpenSelectToken = ref(false);
let selectedToken = ref(ethereum);
let amount = ref(0);
let isOpenSelectFee = ref(false);
let fee = ref(recommendedFee);
let isSendToken = ref(true);
let selectedNft = ref(nft);
let isOpenSelectNft = ref(false);

const selected: string = route.params.id as string;

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

const selectToken = (token: Token) => {
  selectedToken.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (number: number) => {
  amount.value = number;
};

const toggleSelectFee = (open: boolean) => {
  isOpenSelectFee.value = open;
};

const selectFee = (option: TransactionFee) => {
  fee.value = option;
  isOpenSelectFee.value = false;
};

const sendButtonTitle = () => {
  let title = "Send";

  if (amount.value > 0)
    title =
      "Send " + amount.value + " " + selectedToken.value.symbol.toUpperCase();

  if (!isSendToken.value) {
    title = "Send NFT";
  }

  return title;
};

const isDisabled = () => {
  let isDisabled = true;

  if (amount.value > 0) isDisabled = false;

  if (!isSendToken.value) {
    isDisabled = false;
  }

  return isDisabled;
};

const sendAction = () => {
  router.push({
    name: "verify-transaction",
    params: { id: selected, isNft: isSendToken.value ? 0 : 1 },
  });
};

const toggleSelector = () => {
  isSendToken.value = !isSendToken.value;
};

const toggleSelectNft = (open: boolean) => {
  isOpenSelectNft.value = open;
};

const selectItem = (item: NFTItem) => {
  selectedNft.value = item;
  isOpenSelectNft.value = false;
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
