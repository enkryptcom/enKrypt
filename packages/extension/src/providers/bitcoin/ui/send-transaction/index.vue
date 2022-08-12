<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <send-header
        :close="close"
        :toggle-type="toggleSelector"
        :is-send-token="isSendToken"
      />

      <send-address-input
        ref="addressInputFrom"
        :from="true"
        :value="addressFrom"
        :network="(network as BitcoinNetwork)"
        :disable-direct-input="true"
        @click="toggleSelectContactFrom(true)"
        @update:input-address="inputAddressFrom"
        @toggle:show-contacts="toggleSelectContactFrom"
      />

      <send-from-contacts-list
        :show-accounts="isOpenSelectContactFrom"
        :account-info="accountInfo"
        :address="addressFrom"
        :network="network"
        @selected:account="selectAccountFrom"
        @close="toggleSelectContactFrom"
      />

      <send-address-input
        ref="addressInputTo"
        :value="addressTo"
        :network="(network as BitcoinNetwork)"
        @update:input-address="inputAddressTo"
        @toggle:show-contacts="toggleSelectContactTo"
      />

      <send-contacts-list
        :show-accounts="isOpenSelectContactTo"
        :account-info="accountInfo"
        :address="addressTo"
        :network="network"
        @selected:account="selectAccountTo"
        @update:paste-from-clipboard="addressInputTo.pasteFromClipboard()"
        @close="toggleSelectContactTo"
      />

      <send-token-select :token="selectedAsset" />

      <send-input-amount
        v-if="isSendToken"
        :amount="amount"
        :fiat-value="selectedAsset.price"
        :has-enough-balance="hasEnoughBalance"
        @update:input-amount="inputAmount"
        @update:input-set-max="setMaxValue"
      />

      <send-fee-select
        :in-swap="false"
        :selected="selectedFee"
        :fee="gasCostValues[selectedFee]"
        @open-popup="toggleSelectFee"
      />

      <transaction-fee-view
        :fees="gasCostValues"
        :show-fees="isOpenSelectFee"
        :selected="selectedFee"
        :is-header="true"
        @close-popup="toggleSelectFee"
        @gas-type-changed="selectFee"
      />

      <send-alert
        v-show="hasEnoughBalance && nativeBalanceAfterTransaction.isNeg()"
        :native-symbol="network.name"
        :price="selectedAsset.price || '0'"
        :native-value="
          fromBase(
            nativeBalanceAfterTransaction.abs().toString(),
            network.decimals
          )
        "
        :decimals="network.decimals"
      />

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
import SendFromContactsList from "./components/send-from-contacts-list.vue";
import SendContactsList from "./components/send-contacts-list.vue";
import SendTokenSelect from "./components/send-token-select.vue";
import SendAlert from "./components/send-alert.vue";
import SendInputAmount from "./components/send-input-amount.vue";
import SendFeeSelect from "./components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { AccountsHeaderData } from "@action/types/account";
import { toBN } from "web3-utils";
import { GasPriceTypes } from "../../../../providers/ethereum/libs/transaction/types";
import { GasFeeType } from "../../../../providers/ethereum/ui/types";
import { BitcoinNetwork } from "../../types/bitcoin-network";
import { BTCToken } from "../../types/btc-token";
import BigNumber from "bignumber.js";
import { defaultGasCostVals } from "@/providers/ethereum/ui/common/default-vals";
import { fromBase, toBase, isValidDecimals } from "@/libs/utils/units";
import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import { routes as RouterNames } from "@/ui/action/router";
import getUiPath from "@/libs/utils/get-ui-path";
import Browser from "webextension-polyfill";
import { ProviderName } from "@/types/provider";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { BaseNetwork } from "@/types/base-network";

import { isAddress } from "../../libs/utils";
import BitcoinAPI from "@/providers/bitcoin/libs/api";
import { Psbt as BTCTransaction } from "bitcoinjs-lib";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import sendUsingInternalMessengers from "@/libs/messenger/internal-messenger";
import { InternalMethods } from "@/types/messenger";
import { calculateSize } from "../libs/tx-size";
import { HaskoinUnspentType } from "../../types";

const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});
const loadingAsset = new BTCToken({
  icon: props.network.icon,
  symbol: "Loading",
  balance: "0",
  price: "0",
  name: "loading",
  decimals: props.network.decimals,
});

const addressInputTo = ref();
const route = useRoute();
const router = useRouter();
const selected: string = route.params.id as string;
const selectedAsset = ref<BTCToken>(loadingAsset);
const amount = ref<string>("");
const accountUTXOs = ref<HaskoinUnspentType[]>([]);

const hasEnoughBalance = computed(() => {
  if (!isValidDecimals(sendAmount.value, selectedAsset.value.decimals!)) {
    return false;
  }
  return toBN(selectedAsset.value.balance ?? "0").gte(
    toBN(toBase(sendAmount.value ?? "0", selectedAsset.value.decimals!)).add(
      toBN(
        toBase(
          gasCostValues.value[selectedFee.value].nativeValue,
          selectedAsset.value.decimals!
        )
      )
    )
  );
});

const sendAmount = computed(() => {
  if (amount.value && amount.value !== "") return amount.value;
  return "0";
});

const isMaxSelected = ref<boolean>(false);
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.REGULAR);
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const addressFrom = ref<string>(
  props.accountInfo.selectedAccount?.address ?? ""
);
const addressTo = ref<string>("");
const isLoadingAssets = ref(true);

const nativeBalance = computed(() => {
  const accountIndex = props.accountInfo.activeAccounts.findIndex(
    (acc) => acc.address === addressFrom.value
  );
  if (accountIndex !== -1) {
    const balance = props.accountInfo.activeBalances[accountIndex];
    if (balance !== undefined) {
      return toBase(balance, props.network.decimals);
    }
  }
  return "0";
});

onMounted(async () => {
  fetchAssets().then(setBaseCosts);
});

const nativeBalanceAfterTransaction = computed(() => {
  if (nativeBalance.value && amount.value !== "") {
    const rawAmount = toBN(toBase(amount.value, selectedAsset.value.decimals!));
    return toBN(nativeBalance.value).sub(rawAmount);
  }
  return toBN(0);
});

const setTransactionFees = (byteSize: number) => {
  const gasVals = {
    [GasPriceTypes.FASTEST]: (byteSize * 25).toString(),
    [GasPriceTypes.FAST]: (byteSize * 20).toString(),
    [GasPriceTypes.REGULAR]: (byteSize * 10).toString(),
    [GasPriceTypes.ECONOMY]: (byteSize * 5).toString(),
  };
  const getConvertedVal = (type: GasPriceTypes) =>
    fromBase(gasVals[type], props.network.decimals);
  const nativeVal = selectedAsset.value.price || "0";
  gasCostValues.value = {
    [GasPriceTypes.ECONOMY]: {
      nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
      fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.ECONOMY))
        .times(nativeVal!)
        .toString(),
      nativeSymbol: props.network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.REGULAR]: {
      nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
      fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.REGULAR))
        .times(nativeVal!)
        .toString(),
      nativeSymbol: props.network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FAST]: {
      nativeValue: getConvertedVal(GasPriceTypes.FAST),
      fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST))
        .times(nativeVal!)
        .toString(),
      nativeSymbol: props.network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FASTEST]: {
      nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
      fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FASTEST))
        .times(nativeVal!)
        .toString(),
      nativeSymbol: props.network.currencyName,
      fiatSymbol: "USD",
    },
  };
};

const setBaseCosts = () => {
  updateUTXOs().then(() => {
    if (isMaxSelected.value) setMaxValue();
  });
};

const updateUTXOs = async () => {
  const api = (await props.network.api()) as BitcoinAPI;
  return api.getUTXOs(addressFrom.value).then((utxos) => {
    accountUTXOs.value = utxos;
    const txSize = calculateSize(
      {
        input_count: accountUTXOs.value.length,
      },
      {
        p2wpkh_output_count: 2,
      }
    );
    console.log(utxos, txSize);
    setTransactionFees(Math.ceil(txSize.txVBytes));
  });
};

const fetchAssets = () => {
  selectedAsset.value = loadingAsset;
  isLoadingAssets.value = true;
  return props.network.getAllTokens(addressFrom.value).then((allAssets) => {
    selectedAsset.value = allAssets[0] as BTCToken;
    isLoadingAssets.value = false;
  });
};

const sendButtonTitle = computed(() => {
  let title = "Send";
  if (parseInt(sendAmount.value) > 0)
    title =
      "Send " +
      formatFloatingPointValue(sendAmount.value).value +
      " " +
      selectedAsset.value?.symbol!.toUpperCase();
  return title;
});

const isInputsValid = computed<boolean>(() => {
  if (
    !isAddress(addressTo.value, (props.network as BitcoinNetwork).networkInfo)
  )
    return false;
  if (!isValidDecimals(sendAmount.value, selectedAsset.value.decimals!)) {
    return false;
  }
  if (new BigNumber(sendAmount.value).gt(assetMaxValue.value)) return false;
  return true;
});

watch([addressFrom], () => {
  if (addressFrom.value) {
    fetchAssets().then(setBaseCosts);
  }
});

const isOpenSelectContactFrom = ref<boolean>(false);
const isOpenSelectContactTo = ref<boolean>(false);

const isOpenSelectFee = ref<boolean>(false);
const isSendToken = ref(true);

const close = () => {
  router.go(-1);
};

const assetMaxValue = computed(() => {
  return fromBase(
    toBN(selectedAsset.value.balance!)
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
});

const setMaxValue = () => {
  isMaxSelected.value = true;
  amount.value =
    parseFloat(assetMaxValue.value) < 0 ? "0" : assetMaxValue.value;
};
const inputAddressFrom = (text: string) => {
  addressFrom.value = text;
};

const inputAddressTo = (text: string) => {
  console.log(text);
  addressTo.value = text;
};

const toggleSelectContactFrom = (open: boolean) => {
  isOpenSelectContactFrom.value = open;
};

const toggleSelectContactTo = (open: boolean) => {
  isOpenSelectContactTo.value = open;
};

const selectAccountFrom = (account: string) => {
  addressFrom.value = account;
  isOpenSelectContactFrom.value = false;
  fetchAssets();
};

const selectAccountTo = (account: string) => {
  addressTo.value = props.network.displayAddress(account);
  isOpenSelectContactTo.value = false;
};

const inputAmount = (inputAmount: string) => {
  if (inputAmount === "") {
    inputAmount = "0";
  }
  const inputAmountBn = new BigNumber(inputAmount);
  isMaxSelected.value = false;
  amount.value = inputAmountBn.lt(0) ? "0" : inputAmountBn.toFixed();
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};

const selectFee = (type: GasPriceTypes) => {
  selectedFee.value = type;
  isOpenSelectFee.value = false;
  if (isMaxSelected.value) setMaxValue();
};

const sendAction = async () => {
  const keyring = new PublicKeyRing();
  const fromAccountInfo = await keyring.getAccount(addressFrom.value);
  const networkInfo = (props.network as BitcoinNetwork).networkInfo;
  const api = (await props.network.api()) as BitcoinAPI;
  const utxos = await api.getUTXOs(fromAccountInfo.address);
  const tx = new BTCTransaction({
    network: networkInfo,
  });
  utxos.forEach((u) => {
    tx.addInput({
      hash: u.txid,
      index: u.index,
      witnessUtxo: {
        script: Buffer.from(u.pkscript, "hex"),
        value: u.value,
      },
    });
  });
  const signer = {
    publicKey: hexToBuffer(fromAccountInfo.address),
    network: networkInfo,
    sign: (hash: Buffer, lowR?: boolean): Promise<Buffer> => {
      console.log(bufferToHex(hash), lowR, "sign hash");
      return sendUsingInternalMessengers({
        method: InternalMethods.sign,
        params: [bufferToHex(hash), fromAccountInfo],
      }).then((res) => {
        console.log(JSON.parse(res.result!), "response");
        return hexToBuffer(JSON.parse(res.result!)).subarray(0, 64);
      });
    },
  };
  const balance = toBN(selectedAsset.value.balance!);
  const sendAmount = toBN(toBase(amount.value, selectedAsset.value.decimals));
  const currentFee = toBN(
    toBase(
      gasCostValues.value[selectedFee.value].nativeValue,
      selectedAsset.value.decimals
    )
  );
  const remainder = balance.sub(sendAmount).sub(currentFee);

  tx.addOutput({
    address: addressTo.value,
    value: sendAmount.toNumber(),
  });

  if (remainder.gtn(0)) {
    tx.addOutput({
      address: props.network.displayAddress(addressFrom.value),
      value: remainder.toNumber(),
    });
  }

  await tx.signAllInputsAsync(signer);
  tx.finalizeAllInputs();
  console.log(
    tx.getFee(),
    tx.getFeeRate(),
    tx.getFee() / tx.getFeeRate(),
    calculateSize(
      {
        input_count: tx.txInputs.length,
      },
      {
        p2wpkh_output_count: tx.txOutputs.length,
      }
    ),
    tx,
    addressTo.value,
    tx.extractTransaction().toHex()
  );
  api.broadcastTx(tx.extractTransaction().toHex()).then(console.log);
  // const routedRoute = router.resolve({
  //   name: RouterNames.verify.name,
  //   query: {
  //     id: selected,
  //     txData: Buffer.from(JSON.stringify(txVerifyInfo), "utf8").toString(
  //       "base64"
  //     ),
  //   },
  // });

  // if (fromAccountInfo.isHardware) {
  //   await Browser.windows.create({
  //     url: Browser.runtime.getURL(
  //       getUiPath(
  //         `eth-hw-verify?id=${routedRoute.query.id}&txData=${routedRoute.query.txData}`,
  //         ProviderName.ethereum
  //       )
  //     ),
  //     type: "popup",
  //     focused: true,
  //     height: 600,
  //     width: 460,
  //   });
  // } else {
  //   router.push(routedRoute);
  // }
};

const toggleSelector = (isTokenSend: boolean) => {
  isSendToken.value = isTokenSend;
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
