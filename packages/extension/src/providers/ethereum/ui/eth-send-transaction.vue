<template>
  <common-popup>
    <template #header>
      <sign-logo color="#05C0A5" class="common-popup__logo"></sign-logo>
    </template>

    <template #content>
      <h2>Send Transaction</h2>

      <div class="common-popup__block">
        <div class="common-popup__account">
          <img :src="identicon" />
          <div class="common-popup__account-info">
            <h4>{{ account.name }}</h4>
            <p>
              {{ $filters.replaceWithEllipsis(account.address, 6, 4) }}
            </p>
          </div>
        </div>
      </div>
      <div class="common-popup__block">
        <div class="common-popup__info">
          <img :src="options.faviconURL" />
          <div class="common-popup__info-info">
            <h4>{{ options.title }}</h4>
            <p>{{ options.domain }}</p>
          </div>
        </div>

        <p class="common-popup__message">
          {{ message }}
        </p>
      </div>
    </template>

    <template #button-left>
      <base-button title="Cancel" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Sign" :click="approve" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import { KeyRecord } from "@enkryptcom/types";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { computed } from "vue";
import { bufferToHex } from "@enkryptcom/utils";
import { fromRpcSig } from "ethereumjs-util";
import { DEFAULT_NETWORK_NAME, getNetworkByName } from "@/libs/utils/networks";
import { NodeType } from "@/types/provider";
import { EthereumTransaction } from "../libs/transaction/types";
import Transaction from "@/providers/ethereum/libs/transaction";
import Web3 from "web3";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
const { PromiseResolve, options, Request, sendToBackground } =
  WindowPromiseHandler();
const message = computed(() => {
  return "tx signing";
});
const network = computed(() => {
  if (Request.value.params && Request.value.params.length > 2)
    return getNetworkByName(Request.value.params[2]) as NodeType;
  else return getNetworkByName(DEFAULT_NETWORK_NAME) as NodeType;
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
</script>

<style lang="less" scoped>
@import "~@/providers/ethereum/ui/styles/common-popup.less";
</style>
