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
        :toggle-select="toggleSelectToken"
        :network="network"
        :account-info="accountInfo"
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
        :input="inputAmount"
        :value="amount"
        :account-info="accountInfo"
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
            :title="sendButtonTitle()"
            :click="sendAction"
            :disabled="isDisabled"
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
import Web3 from "web3";
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
import { fromWei, toBN, toWei } from "web3-utils";
import { getPriorityFeeBasedOnType } from "@/providers/ethereum/libs/transaction/gas-utils";
import { nft } from "@action/types/mock";
import { GasPriceTypes } from "../../../../providers/ethereum/libs/transaction/types";
import { GasFeeType } from "../../../../providers/ethereum/ui/types";
import { EvmNetwork } from "../../types/evm-network";
import { AssetsType } from "@/types/provider";

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
  name: "loading",
});

let web3: any;
let isOpenSelectContact = ref<boolean>(false);
let address = ref<string>("");
let isOpenSelectToken = ref<boolean>(false);

let amount = ref<number>(0);
let isOpenSelectFee = ref<boolean>(false);
let isSendToken = ref(true);
let selectedNft = ref(nft);
let isOpenSelectNft = ref(false);

const selectedFee = ref<GasPriceTypes>(GasPriceTypes.ECONOMY);

const gasCostValues = ref<GasFeeType>({
  [GasPriceTypes.ECONOMY]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "ETH",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.REGULAR]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "ETH",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.FAST]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "ETH",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.FASTEST]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "ETH",
    fiatSymbol: "USD",
  },
});

const getPriorityFees = async () => {
  const gasPrice = await getGasPrice();
  const gasLimit = await getGasLimit();
  const baseFeePerGas = await getBaseFeePerGas();

  gasCostValues.value = {
    [GasPriceTypes.ECONOMY]: {
      nativeValue: await getFees(
        GasPriceTypes.ECONOMY,
        gasPrice,
        gasLimit,
        baseFeePerGas
      ).toString(),
      fiatValue: fromWei(
        await getFees(GasPriceTypes.ECONOMY, gasPrice, gasLimit, baseFeePerGas)
      ).toString(),
      nativeSymbol: props.network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.REGULAR]: {
      nativeValue: await getFees(
        GasPriceTypes.REGULAR,
        gasPrice,
        gasLimit,
        baseFeePerGas
      ).toString(),
      fiatValue: fromWei(
        await getFees(GasPriceTypes.REGULAR, gasPrice, gasLimit, baseFeePerGas)
      ).toString(),
      nativeSymbol: props.network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FAST]: {
      nativeValue: await getFees(
        GasPriceTypes.REGULAR,
        gasPrice,
        gasLimit,
        baseFeePerGas
      ).toString(),
      fiatValue: fromWei(
        await getFees(GasPriceTypes.FAST, gasPrice, gasLimit, baseFeePerGas)
      ).toString(),
      nativeSymbol: props.network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FASTEST]: {
      nativeValue: await getFees(
        GasPriceTypes.FASTEST,
        gasPrice,
        gasLimit,
        baseFeePerGas
      ).toString(),
      fiatValue: fromWei(
        await getFees(GasPriceTypes.FASTEST, gasPrice, gasLimit, baseFeePerGas)
      ).toString(),
      nativeSymbol: props.network.currencyName,
      fiatSymbol: "USD",
    },
  };
};

const close = () => {
  router.go(-1);
};

const inputAddress = (text: string) => {
  console.log(text, "sdfdf");
  address.value = text;
};

const toggleSelectContact = (open: boolean) => {
  isOpenSelectContact.value = open;
};

const toggleSelectToken = (open: boolean) => {
  isOpenSelectToken.value = open;
};

const selectAccount = (account: string) => {
  address.value = account;
  isOpenSelectContact.value = false;
};

const selectToken = (token: AssetsType) => {
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (number: number) => {
  amount.value = number;
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
  // if (props.network.getAllTokenInfo) {
  //   props.network
  //     .assetsHandler(
  //       props.network,
  //       props.accountInfo.selectedAccount?.address || ""
  //     )
  //     .then((_assets) => {
  //       let token = _assets.find((asset) => asset.name === "Ethereum");
  //       if (!token) token = _assets[0];
  //       selectedToken.value = {
  //         name: token.name as string,
  //         symbol: token.symbol as string,
  //         icon: token.icon as string,
  //         amount: token.balancef as unknown as number,
  //         price: token.balanceUSDf as unknown as number,
  //       };
  //     });
  // }
};

const getBaseFeePerGas = async () => {
  return await web3.eth.getBlockNumber().then((blockNum: any) => {
    return web3.eth
      .getBlock(blockNum, false)
      .then((block: any) => block.baseFeePerGas);
  });
};

const getGasPrice = async () => {
  return await web3.eth.getGasPrice();
};

const getGasLimit = async () => {
  return await web3.eth.estimateGas({
    from: props.accountInfo.selectedAccount?.address,
  });
};

const getFees = async (
  priority: any,
  price: string,
  limit: number,
  base: number
) => {
  return getPriorityFeeBasedOnType(
    base?.toString() as string,
    toBN(price).mul(toBN(limit)).toString(),
    priority
  );
};

const sendButtonTitle = () => {
  let title = "Send";

  if (amount.value > 0)
    title =
      "Send " + amount.value + " " + selectedAsset.value?.symbol!.toUpperCase();

  if (!isSendToken.value) {
    title = "Send NFT";
  }

  return title;
};

const isDisabled = computed(() => {
  if (amount.value === 0) return true;
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

onMounted(async () => {
  // web3 = await new Web3(props.network.node);
  // await getPriorityFees();
  fetchAssets();
});
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
