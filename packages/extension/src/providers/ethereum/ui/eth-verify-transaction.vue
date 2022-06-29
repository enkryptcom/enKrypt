<template>
  <common-popup>
    <template #header>
      <sign-logo color="#05C0A5" class="common-popup__logo"></sign-logo>
      <div class="common-popup__network">
        <img :src="network.icon" />
        <p>{{ network.name_long }}</p>
      </div>
    </template>

    <template #content>
      <h2>Verify transaction</h2>

      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account">
          <img :src="identicon" />
          <div class="provider-verify-transaction__account-info">
            <h4>{{ account.name }}</h4>
            <div>
              <p>
                {{
                  TokenBalance == "~"
                    ? "~"
                    : $filters.formatFloatingPointValue(TokenBalance).value
                }}
                <span>{{ network.currencyName }}</span>
              </p>
              <p>
                {{ $filters.replaceWithEllipsis(account.address, 6, 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img :src="Options.faviconURL" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ Options.title }}</h4>
            <p>{{ Options.domain }}</p>
          </div>
        </div>

        <div class="provider-verify-transaction__amount">
          <img :src="decodedTx?.tokenImage || network.icon" />

          <div class="provider-verify-transaction__amount-info">
            <h4>
              {{
                $filters.formatFloatingPointValue(
                  fromBase(
                    decodedTx?.tokenValue || "0x0",
                    decodedTx?.tokenDecimals || 18
                  )
                ).value
              }}
              <span>{{ decodedTx?.tokenName || network.currencyName }}</span>
            </h4>
            <p>
              ${{
                fiatValue !== "~"
                  ? $filters.formatFiatValue(fiatValue).value
                  : fiatValue
              }}
            </p>
          </div>
        </div>

        <!-- <div class="provider-verify-transaction__error">
          <alert-icon />
          <p>
            Warning: you will allow this DApp to spend any amount of ETH at any
            time in the future. Please proceed only if you are trust this DApp.
          </p>
        </div> -->
      </div>

      <send-fee-select
        :in-swap="true"
        :selected="selectedFee"
        :fee="gasCostValues[selectedFee]"
        @open-popup="toggleSelectFee"
      ></send-fee-select>

      <!-- <best-offer-error :not-enough-verify="true"></best-offer-error> -->

      <div class="provider-verify-transaction__data">
        <a
          class="provider-verify-transaction__data-link"
          :class="{ open: isOpenData }"
          @click="toggleData"
          ><span>Show data</span> <right-chevron
        /></a>

        <div v-show="isOpenData" class="provider-verify-transaction__data-text">
          <p>Data Hex: {{ decodedTx?.dataHex || "0x" }}</p>
        </div>
      </div>

      <transaction-fee-view
        :fees="gasCostValues"
        :show-fees="isOpenSelectFee"
        :selected="selectedFee"
        :is-header="true"
        @close-popup="toggleSelectFee"
        @gas-type-changed="selectFee"
      ></transaction-fee-view>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Sign" :click="approve" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { ref, ComponentPublicInstance, onBeforeMount } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import RightChevron from "@action/icons/common/right-chevron.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import SendFeeSelect from "./send-transaction/components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import { KeyRecord } from "@enkryptcom/types";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { bufferToHex } from "@enkryptcom/utils";
import { fromRpcSig } from "ethereumjs-util";
import { DEFAULT_NETWORK_NAME, getNetworkByName } from "@/libs/utils/networks";
import {
  DecodedTx,
  EthereumTransaction,
  GasPriceTypes,
} from "../libs/transaction/types";
import Transaction from "@/providers/ethereum/libs/transaction";
import Web3 from "web3";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { EvmNetwork } from "../types/evm-network";
import { fromBase } from "@/libs/utils/units";
import { decodeTx } from "../libs/transaction/decoder";
import { ProviderRequestOptions } from "@/types/provider";
import BigNumber from "bignumber.js";
import { GasFeeType } from "./types";
import MarketData from "@/libs/market-data";

const isOpenSelectFee = ref(false);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();
const isOpenData = ref(false);
const TokenBalance = ref<string>("~");
const fiatValue = ref<string>("~");
const decodedTx = ref<DecodedTx>();
const network = ref<EvmNetwork>(
  getNetworkByName(DEFAULT_NETWORK_NAME) as EvmNetwork
);
const marketdata = new MarketData();
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
const account = ref<KeyRecord>({
  name: "",
  address: "",
} as KeyRecord);
const identicon = ref<string>("");
const windowPromise = WindowPromiseHandler(3);
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
});
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.ECONOMY);
defineExpose({ providerVerifyTransactionScrollRef });

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = getNetworkByName(Request.value.params![2]) as EvmNetwork;
  account.value = Request.value.params![1] as KeyRecord;
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
  if (network.value.api) {
    const api = await network.value.api();
    const balance = await api.getBalance(account.value.address);
    TokenBalance.value = fromBase(balance, network.value.decimals);
  }
  await decodeTx(
    Request.value.params![0] as EthereumTransaction,
    network.value as EvmNetwork
  ).then((decoded) => {
    decodedTx.value = decoded;
    fiatValue.value = new BigNumber(
      fromBase(decoded.tokenValue, decoded.tokenDecimals)
    )
      .times(decoded.currentPriceUSD)
      .toFixed(2);
  });
  const web3 = new Web3(network.value.node);
  const tx = new Transaction(
    Request.value.params![0] as EthereumTransaction,
    web3
  );
  await tx.getGasCosts().then(async (gasvals) => {
    let nativeVal = "0";
    if (network.value.coingeckoID) {
      await marketdata
        .getTokenValue("1", network.value.coingeckoID, "USD")
        .then((val) => (nativeVal = val));
    }
    const getConvertedVal = (type: GasPriceTypes) =>
      fromBase(gasvals[type], network.value.decimals);

    gasCostValues.value = {
      [GasPriceTypes.ECONOMY]: {
        nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.ECONOMY))
          .times(nativeVal)
          .toString(),
        nativeSymbol: network.value.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.REGULAR]: {
        nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.REGULAR))
          .times(nativeVal)
          .toString(),
        nativeSymbol: network.value.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.FAST]: {
        nativeValue: getConvertedVal(GasPriceTypes.FAST),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST))
          .times(nativeVal)
          .toString(),
        nativeSymbol: network.value.currencyName,
        fiatSymbol: "USD",
      },
      [GasPriceTypes.FASTEST]: {
        nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
        fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FASTEST))
          .times(nativeVal)
          .toString(),
        nativeSymbol: network.value.currencyName,
        fiatSymbol: "USD",
      },
    };
  });
});

const approve = async () => {
  const { Request, sendToBackground, Resolve } = await windowPromise;
  const web3 = new Web3(network.value.node);
  const tx = new Transaction(
    Request.value.params![0] as EthereumTransaction,
    web3
  );
  tx.getFinalizedTransaction({ gasPriceType: selectedFee.value }).then(
    (finalizedTx) => {
      const msgHash = bufferToHex(finalizedTx.getMessageToSign(true));
      sendToBackground({
        method: InternalMethods.sign,
        params: [msgHash, account.value],
      }).then((res) => {
        if (res.error) {
          Resolve.value(res);
        } else {
          const rpcSig = fromRpcSig(res.result || "0x");
          const signedTx = (
            finalizedTx as FeeMarketEIP1559Transaction
          )._processSignature(rpcSig.v, rpcSig.r, rpcSig.s);
          web3.eth
            .sendSignedTransaction("0x" + signedTx.serialize().toString("hex"))
            .on("transactionHash", (hash) => {
              Resolve.value({
                result: JSON.stringify(hash),
              });
            })
            .on("error", (error) => {
              Resolve.value({
                error: getCustomError(error.message),
              });
            });
        }
      });
    }
  );
};
const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};
const selectFee = (type: GasPriceTypes) => {
  selectedFee.value = type;
  toggleSelectFee();
};
const toggleData = () => {
  isOpenData.value = !isOpenData.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "./styles/verify-transaction.less";
</style>
