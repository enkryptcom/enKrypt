<template>
  <div class="provider-verify-transaction">
    <sign-logo
      color="#05C0A5"
      class="provider-verify-transaction__logo"
    ></sign-logo>
    <div class="provider-verify-transaction__network">
      <img :src="network.icon" />
      <p>{{ network.name_long }}</p>
    </div>
    <h2>Verify Transaction</h2>

    <custom-scrollbar
      tem="providerVerifyTransactionScrollRef"
      class="provider-verify-transaction__scroll-area"
      :settings="ScrollSettings({ suppressScrollX: true })"
    >
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
          <img :src="options.faviconURL" />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ options.title }}</h4>
            <p>{{ options.domain }}</p>
          </div>
        </div>

        <div class="provider-verify-transaction__amount">
          <img :src="decodedTx?.tokenImage" />

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
            <p>$4520.54</p>
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
        :fee="fee"
        :toggle-select="toggleSelectFee"
        :in-swap="true"
      ></send-fee-select>

      <!-- <best-offer-error :not-enought-verify="true"></best-offer-error> -->

      <div class="provider-verify-transaction__data">
        <a
          class="provider-verify-transaction__data-link"
          :class="{ open: isOpenData }"
          @click="toggleData"
          ><span>Show data</span> <right-chevron
        /></a>

        <div v-show="isOpenData" class="provider-verify-transaction__data-text">
          <p>Function type: Register Proxy 0xddd81f82</p>
          <p>Parameters: []</p>
          <p>HEX data: 4 BYTES</p>
          <p>0xddd81f82</p>
          <p>Verified contract on <a href="#">Etherscan</a></p>
          <p>Decoded by Truffle</p>
        </div>
      </div>
    </custom-scrollbar>

    <transaction-fee-view
      :show-fees="isOpenSelectFee"
      :close="toggleSelectFee"
      :select-fee="selectFee"
      :selected="fee.price.speed"
      :is-header="true"
    ></transaction-fee-view>

    <div
      class="provider-verify-transaction__buttons"
      :class="{ border: isHasScroll() }"
    >
      <div class="provider-verify-transaction__buttons-cancel">
        <base-button title="Decline" :click="deny" :no-background="true" />
      </div>
      <div class="provider-verify-transaction__buttons-send">
        <base-button title="Sign" :click="approve" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, ComponentPublicInstance, watch } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import RightChevron from "@action/icons/common/right-chevron.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SendFeeSelect from "@action/views/send-transaction/components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import { TransactionFee } from "@action/types/fee";
import { recommendedFee } from "@action/types/mock";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
//import BestOfferError from "@action/views/swap-best-offer/components/swap-best-offer-block/components/best-offer-error.vue";
// import AlertIcon from "@action/icons/send/alert-icon.vue";
import ScrollSettings from "@/libs/utils/scroll-settings";
import { KeyRecord } from "@enkryptcom/types";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { computed } from "vue";
import { bufferToHex } from "@enkryptcom/utils";
import { fromRpcSig } from "ethereumjs-util";
import { DEFAULT_NETWORK_NAME, getNetworkByName } from "@/libs/utils/networks";
import { DecodedTx, EthereumTransaction } from "../libs/transaction/types";
import Transaction from "@/providers/ethereum/libs/transaction";
import Web3 from "web3";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { EvmNetwork } from "../types/evm-network";
import { fromBase } from "@/libs/utils/units";
import { decodeTx } from "../libs/transaction/decoder";

const isOpenSelectFee = ref(false);
const fee = ref(recommendedFee);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();
const isOpenData = ref(false);
const TokenBalance = ref<string>("~");
const decodedTx = ref<DecodedTx>();
const { PromiseResolve, options, Request, sendToBackground } =
  WindowPromiseHandler();

defineExpose({ providerVerifyTransactionScrollRef });

const network = computed(() => {
  if (Request.value.params && Request.value.params.length > 2)
    return getNetworkByName(Request.value.params[2]) as EvmNetwork;
  else return getNetworkByName(DEFAULT_NETWORK_NAME) as EvmNetwork;
});
const account = computed(() => {
  if (Request.value.params && Request.value.params.length > 1) {
    return Request.value.params[1] as KeyRecord;
  } else
    return {
      name: "",
      address: "",
    } as KeyRecord;
});
const identicon = computed(() => {
  return network.value.identicon(account.value.address);
});
watch(account, async () => {
  if (account.value.address != "" && network.value.api) {
    const api = await network.value.api();
    const balance = await api.getBalance(account.value.address);
    TokenBalance.value = fromBase(balance, network.value.decimals);
  }
  if (Request.value.params && Request.value.params.length > 1) {
    decodeTx(
      Request.value.params[0] as EthereumTransaction,
      network.value
    ).then((decoded) => (decodedTx.value = decoded));
  }
});
const approve = () => {
  if (!Request.value.params || Request.value.params.length < 2) {
    return PromiseResolve.value({ error: getCustomError("No params") });
  }
  const web3 = new Web3(network.value.node);
  const tx = new Transaction(
    Request.value.params[0] as EthereumTransaction,
    web3
  );
  tx.getFinalizedTransaction().then((finalizedTx) => {
    const msgHash = bufferToHex(finalizedTx.getMessageToSign(true));
    sendToBackground({
      method: InternalMethods.sign,
      params: [msgHash, account.value],
    }).then((res) => {
      if (res.error) {
        PromiseResolve.value(res);
      } else {
        const rpcSig = fromRpcSig(res.result || "0x");
        const signedTx = (
          finalizedTx as FeeMarketEIP1559Transaction
        )._processSignature(rpcSig.v, rpcSig.r, rpcSig.s);
        web3.eth
          .sendSignedTransaction("0x" + signedTx.serialize().toString("hex"))
          .on("transactionHash", (hash) => {
            PromiseResolve.value({
              result: JSON.stringify(hash),
            });
          })
          .on("error", (error) => {
            PromiseResolve.value({
              error: getCustomError(error.message),
            });
          });
      }
    });
  });
};
const deny = () => {
  PromiseResolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};
const selectFee = (option: TransactionFee) => {
  fee.value = option;
  toggleSelectFee();
};
const isHasScroll = () => {
  if (providerVerifyTransactionScrollRef.value) {
    return providerVerifyTransactionScrollRef.value.$el.classList.contains(
      "ps--active-y"
    );
  }
  return false;
};
const toggleData = () => {
  isOpenData.value = !isOpenData.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "./styles/verify-transaction.less";
</style>
