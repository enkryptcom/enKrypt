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
        :account-info="accountInfo"
        :address="address"
        :network="network"
        @selected:account="selectAccount"
        @update:paste-from-clipboard="addressInput.pasteFromClipboard()"
        @close="toggleSelectContact"
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
        :fiat-value="selectedAsset.value"
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
          <base-button title="Cancel" :click="close" :no-background="true" />
        </div>
        <div class="send-transaction__buttons-send">
          <base-button
            :title="sendButtonTitle"
            :click="sendAction"
            :disabled="!isInputsValid"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, PropType, computed, watch } from "vue";
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
import { isAddress, numberToHex, toBN } from "web3-utils";
import { nft } from "@action/types/mock";
import { GasPriceTypes } from "../../../../providers/ethereum/libs/transaction/types";
import { GasFeeType } from "../../../../providers/ethereum/ui/types";
import { EvmNetwork } from "../../types/evm-network";
import { AssetsType } from "@/types/provider";
import BigNumber from "bignumber.js";
import { defaultGasCostVals } from "../common/default-vals";
import Transaction from "@/providers/ethereum/libs/transaction";
import Web3 from "web3";
import { NATIVE_TOKEN_ADDRESS } from "../../libs/common";
import { fromBase, toBase } from "@/libs/utils/units";
import erc20 from "../../libs/abi/erc20";
import { SendTransactionDataType, VerifyTransactionParams } from "../types";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";

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
  value: "0",
  name: "loading",
  decimals: 18,
});
const amount = ref<string>("0.00");
const hasEnoughBalance = computed(() => {
  return toBN(selectedAsset.value.balance || "0").gte(
    toBN(toBase(amount.value, selectedAsset.value.decimals!))
  );
});
const isMaxSelected = ref<boolean>(false);
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.REGULAR);
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const address = ref<string>("");

onMounted(async () => {
  fetchAssets().then(setBaseCosts);
});

const TxInfo = computed<SendTransactionDataType>(() => {
  const web3 = new Web3();
  const value =
    selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS
      ? numberToHex(toBase(amount.value, props.network.decimals))
      : "0x0";
  const toAddress =
    selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS
      ? address.value
      : selectedAsset.value.contract;
  const tokenContract = new web3.eth.Contract(erc20 as any);
  const data =
    selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS
      ? "0x"
      : tokenContract.methods
          .transfer(address.value, toBase(amount.value, props.network.decimals))
          .encodeABI();
  return {
    chainId: numberToHex(props.network.chainID) as `0x{string}`,
    from: props.accountInfo.selectedAccount!.address as `0x{string}`,
    value: value as `0x${string}`,
    to: toAddress as `0x${string}`,
    data: data as `0x${string}`,
  };
});
const Tx = computed(() => {
  const web3 = new Web3(props.network.node);
  const tx = new Transaction(TxInfo.value, web3);
  return tx;
});

const setTransactionFees = (tx: Transaction) => {
  return tx.getGasCosts().then(async (gasvals) => {
    const getConvertedVal = (type: GasPriceTypes) =>
      fromBase(gasvals[type], props.network.decimals);
    const nativeVal = accountAssets.value[0].value;
    gasCostValues.value = {
      [GasPriceTypes.ECONOMY]: {
        nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.ECONOMY))
          .times(nativeVal)
          .toString(),
        nativeSymbol: props.network.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.REGULAR]: {
        nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.REGULAR))
          .times(nativeVal)
          .toString(),
        nativeSymbol: props.network.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.FAST]: {
        nativeValue: getConvertedVal(GasPriceTypes.FAST),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST))
          .times(nativeVal)
          .toString(),
        nativeSymbol: props.network.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.FASTEST]: {
        nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FASTEST))
          .times(nativeVal)
          .toString(),
        nativeSymbol: props.network.currencyName,
        fiatSymbol: "USD",
      },
    };
  });
};

const setBaseCosts = () => {
  const web3 = new Web3(props.network.node);
  const tx = new Transaction(
    {
      chainId: numberToHex(props.network.chainID) as `0x{string}`,
      from: props.accountInfo.selectedAccount!.address as `0x{string}`,
      value: "0x0",
      to: NATIVE_TOKEN_ADDRESS,
    },
    web3
  );
  setTransactionFees(tx).then(() => {
    if (isMaxSelected.value) setMaxValue();
  });
};
const fetchAssets = () => {
  return props.network
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
      "Send " +
      formatFloatingPointValue(amount.value).value +
      " " +
      selectedAsset.value?.symbol!.toUpperCase();
  if (!isSendToken.value) {
    title = "Send NFT";
  }
  return title;
});

const isInputsValid = computed<boolean>(() => {
  if (!isAddress(address.value)) return false;
  if (new BigNumber(amount.value).gt(assetMaxValue.value)) return false;
  return true;
});

watch([isInputsValid, amount, address, selectedAsset], () => {
  if (isInputsValid.value) {
    setTransactionFees(Tx.value);
  }
});

const isOpenSelectContact = ref<boolean>(false);
const isOpenSelectToken = ref<boolean>(false);

const isOpenSelectFee = ref<boolean>(false);
const isSendToken = ref(true);
const selectedNft = ref(nft);
const isOpenSelectNft = ref(false);

const close = () => {
  router.go(-1);
};

const assetMaxValue = computed(() => {
  if (selectedAsset.value.contract === NATIVE_TOKEN_ADDRESS) {
    return fromBase(
      toBN(selectedAsset.value.balance || "0")
        .sub(
          toBN(
            toBase(
              gasCostValues.value[selectedFee.value].nativeValue,
              selectedAsset.value.decimals!
            )
          )
        )
        .toString(),
      selectedAsset.value.decimals!
    );
  } else
    return fromBase(
      selectedAsset.value.balance!,
      selectedAsset.value.decimals!
    );
});
const setMaxValue = () => {
  isMaxSelected.value = true;
  amount.value = assetMaxValue.value;
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
  inputAmount("0");
  selectedAsset.value = token;
  isOpenSelectToken.value = false;
};

const inputAmount = (inputAmount: string) => {
  isMaxSelected.value = false;
  amount.value = inputAmount;
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectToken.value;
};

const selectFee = (type: GasPriceTypes) => {
  selectedFee.value = type;
  isOpenSelectFee.value = false;
  if (isMaxSelected.value) setMaxValue();
};

const sendAction = () => {
  const txVerifyInfo: VerifyTransactionParams = {
    TransactionData: TxInfo.value,
    toToken: {
      amount: amount.value,
      icon: selectedAsset.value.icon as string,
      symbol: selectedAsset.value.symbol || "unknown",
      valueUSD: new BigNumber(selectedAsset.value.value || "0")
        .times(amount.value)
        .toString(),
    },
    fromAddress: props.accountInfo.selectedAccount!.address,
    fromAddressName: props.accountInfo.selectedAccount!.name,
    gasFee: gasCostValues.value[selectedFee.value],
    gasPriceType: selectedFee.value,
    toAddress: address.value,
  };
  router.push({
    name: "verify-transaction",
    params: {
      id: selected,
      txData: JSON.stringify(txVerifyInfo),
    },
  });
};

const toggleSelector = (isTokenSend: boolean) => {
  isSendToken.value = isTokenSend;
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