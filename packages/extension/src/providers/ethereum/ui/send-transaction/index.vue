<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <send-header
        :close="close"
        :toggle-type="toggleSelector"
        :is-send-token="isSendToken"
      ></send-header>
      <send-address-input
        ref="addressInput"
        :value="address"
        :network="network"
        @update:input-address="inputAddress"
        @toggle:show-contacts="toggleSelectContact"
      ></send-address-input>

      <send-contacts-list
        :show-accounts="isOpenSelectContact"
        :close="toggleSelectContact"
        :account-info="accountInfo"
        :address="address"
        :network="network"
        @selected:account="selectAccount"
        @update:paste-from-clipboard="addressInput.pasteFromClipboard()"
      ></send-contacts-list>

      <send-token-select
        v-if="isSendToken"
        :token="selectedAsset"
        @update:toggle-token-select="toggleSelectToken"
      ></send-token-select>

      <assets-select-list
        v-show="isOpenSelectToken"
        :is-send="true"
        :assets="accountAssets"
        @close="toggleSelectToken"
        @update:select-asset="selectToken"
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
        :amount="amount"
        :fiat-value="fiatValue"
        :has-enough-balance="hasEnoughBalance"
        @update:input-amount="inputAmount"
        @update:input-set-max="setMaxValue"
      ></send-input-amount>

      <send-fee-select
        :in-swap="false"
        :selected="selectedFee"
        :fee="gasCostValues[selectedFee]"
        @open-popup="toggleSelectFee"
      ></send-fee-select>

      <transaction-fee-view
        :fees="gasCostValues"
        :show-fees="isOpenSelectFee"
        :selected="selectedFee"
        :is-header="true"
        @close-popup="toggleSelectFee"
        @gas-type-changed="selectFee"
      ></transaction-fee-view>

      <!-- <send-alert></send-alert> -->

      <div class="send-transaction__buttons">
        <div class="send-transaction__buttons-cancel">
          <base-button title="Cancel" :click="close" :gray="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle"
            :click="sendAction"
            :disabled="isDisabled"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, PropType, computed } from "vue";
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
import BaseButton from "@action/components/base-button/index.vue";
import { NFTItem } from "@action/types/nft";
import { AccountsHeaderData } from "@action/types/account";
import { toBN, toWei } from "web3-utils";
import { getPriorityFeeBasedOnType } from "@/providers/ethereum/libs/transaction/gas-utils";
import { nft } from "@action/types/mock";
import { GasPriceTypes } from "../../../../providers/ethereum/libs/transaction/types";
import { GasFeeType } from "../../../../providers/ethereum/ui/types";
import { EvmNetwork } from "../../types/evm-network";
import { AssetsType } from "@/types/provider";
import BigNumber from "bignumber.js";
import { defaultGasCostVals } from "../common/default-vals";
const props = defineProps({
  network: {
    type: Object as PropType<EvmNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const addressInput = ref();
const route = useRoute();
const router = useRouter();
const selected: string = route.params.id as string;
const accountAssets = ref<AssetsType[]>([]);
const selectedAsset = ref<AssetsType | Partial<AssetsType>>({
  icon: props.network.icon,
  balancef: "0.00",
  balanceUSDf: "0.00",
  name: "loading",
});
const amount = ref<string>("0.00");
const fiatValue = computed(() => {
  return new BigNumber(selectedAsset.value.balanceUSDf || "0")
    .div(selectedAsset.value.balancef || "1")
    .toString();
});
const hasEnoughBalance = computed(() => {
  return new BigNumber(selectedAsset.value.balancef || "0").gte(amount.value);
});

onMounted(async () => {
  fetchAssets();
});

let web3: any;
let isOpenSelectContact = ref<boolean>(false);
let address = ref<string>("");
let isOpenSelectToken = ref<boolean>(false);

let isOpenSelectFee = ref<boolean>(false);
let isSendToken = ref(true);
let selectedNft = ref(nft);
let isOpenSelectNft = ref(false);

const selectedFee = ref<GasPriceTypes>(GasPriceTypes.ECONOMY);

const gasCostValues = ref<GasFeeType>(defaultGasCostVals);

const close = () => {
  router.go(-1);
};

const setMaxValue = () => {
  amount.value = selectedAsset.value.balancef || "0.00";
};
const inputAddress = (text: string) => {
  address.value = text;
};

const toggleSelectContact = (open: boolean) => {
  isOpenSelectContact.value = open;
};

const toggleSelectToken = () => {
  isOpenSelectToken.value = !isOpenSelectToken.value;
};

const selectAccount = (account: string) => {
  address.value = account;
  isOpenSelectContact.value = false;
};

const selectToken = (token: AssetsType) => {
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (inputAmount: string) => {
  amount.value = inputAmount;
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectToken.value;
};

const selectFee = (type: GasPriceTypes) => {
  selectedFee.value = type;
  isOpenSelectFee.value = false;
};

const fetchAssets = () => {
  props.network
    .getAllTokenInfo(props.accountInfo.selectedAccount!.address)
    .then((allAssets) => {
      accountAssets.value = allAssets;
      selectedAsset.value = allAssets[0];
    });
};

const sendButtonTitle = computed(() => {
  let title = "Send";
  if (parseInt(amount.value) > 0)
    title =
      "Send " + amount.value + " " + selectedAsset.value?.symbol!.toUpperCase();
  if (!isSendToken.value) {
    title = "Send NFT";
  }
  return title;
});

const isDisabled = computed(() => {
  if (parseInt(amount.value) === 0) return true;
  const amountInWei = toWei(amount.value.toString());
  return !toBN(amountInWei).gt(toBN(0));
});

const sendAction = () => {
  router.push({
    name: "verify-transaction",
    params: {
      id: selected,
      fromAddress: props.accountInfo.selectedAccount?.address,
      address: address.value,
      selectedToken: selectedAsset.value?.toString(),
      amount: amount.value,
      isNft: isSendToken.value ? 0 : 1,
      selectedFee: selectedFee.value.toString(),
    },
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
