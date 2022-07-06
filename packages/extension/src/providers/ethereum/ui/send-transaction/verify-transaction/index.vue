<template>
  <div class="container">
    <div v-if="!!selected" class="verify-transaction">
      <div class="verify-transaction__header">
        <h3>Verify Transaction</h3>
        <a class="verify-transaction__close" @click="close">
          <close-icon />
        </a>
      </div>

      <p class="verify-transaction__description">
        Double check the information and confirm transaction
      </p>
      <div class="verify-transaction__info">
        <verify-transaction-network
          :network="network"
        ></verify-transaction-network>
        <verify-transaction-account
          :name="txData.fromAddressName"
          :address="network.displayAddress(txData.fromAddress)"
          :from="true"
          :network="network"
        ></verify-transaction-account>
        <verify-transaction-account
          :address="network.displayAddress(txData.toAddress)"
          :network="network"
        ></verify-transaction-account>
        <verify-transaction-amount v-if="!isNft" :token="txData.toToken">
        </verify-transaction-amount>
        <verify-transaction-nft
          v-if="isNft"
          :item="nft"
        ></verify-transaction-nft>
        <verify-transaction-fee :fee="txData.gasFee"></verify-transaction-fee>
      </div>

      <div class="verify-transaction__buttons">
        <div class="verify-transaction__buttons-cancel">
          <base-button title="Back" :click="close" :gray="true" />
        </div>
        <div class="verify-transaction__buttons-send">
          <base-button title="Confirm and send" :click="sendAction" />
        </div>
      </div>
    </div>

    <send-process
      v-if="isProcessing"
      :is-nft="isNft"
      :to-address="txData.toAddress"
      :network="network"
      :token="txData.toToken"
    ></send-process>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import VerifyTransactionNetwork from "./components/verify-transaction-network.vue";
import VerifyTransactionAccount from "./components/verify-transaction-account.vue";
import VerifyTransactionAmount from "./components/verify-transaction-amount.vue";
import VerifyTransactionFee from "./components/verify-transaction-fee.vue";
import VerifyTransactionNft from "./components/verify-transaction-nft.vue";
import SendProcess from "@action/views/send-process/index.vue";
import { nft } from "@action/types/mock";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { VerifyTransactionParams } from "../../types";
import { BaseNetwork } from "@/types/base-network";
import Transaction from "@/providers/ethereum/libs/transaction";
import Web3 from "web3";
import { bufferToHex, fromRpcSig } from "ethereumjs-util";
import { sendToBackgroundFromAction } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";

const KeyRing = new PublicKeyRing();
const route = useRoute();
const router = useRouter();
const selected: string = route.params.id as string;
const txData: VerifyTransactionParams = JSON.parse(
  route.params.txData as string
);
const isNft = false;
let isProcessing = ref(false);

const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});

const close = () => {
  router.go(-1);
};

const sendAction = async () => {
  isProcessing.value = true;
  const web3 = new Web3(props.network.node);
  const tx = new Transaction(txData.TransactionData, web3);
  await tx
    .getFinalizedTransaction({ gasPriceType: txData.gasPriceType })
    .then(async (finalizedTx) => {
      const msgHash = bufferToHex(finalizedTx.getMessageToSign(true));
      const account = await KeyRing.getAccount(txData.fromAddress);
      return sendToBackgroundFromAction({
        message: JSON.stringify({
          method: InternalMethods.sign,
          params: [msgHash, account],
        }),
      }).then((res: any) => {
        if (res.error) {
          console.log("error", res.error);
        } else {
          const rpcSig = fromRpcSig(JSON.parse(res.result) || "0x");
          const signedTx = (
            finalizedTx as FeeMarketEIP1559Transaction
          )._processSignature(rpcSig.v, rpcSig.r, rpcSig.s);
          web3.eth
            .sendSignedTransaction("0x" + signedTx.serialize().toString("hex"))
            .on("transactionHash", (hash: string) => {
              console.log("hash", hash);
            })
            .on("error", (error: any) => {
              console.log("ERROR", error);
            });
        }
      });
    });
  setTimeout(() => {
    isProcessing.value = false;
  }, 4000);
  setTimeout(() => {
    router.go(-2);
  }, 4500);
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;
}

.verify-transaction {
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
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__description {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    padding: 4px 141px 16px 32px;
    margin: 0;
  }

  &__info {
    border: 1px solid @gray02;
    box-sizing: border-box;
    border-radius: 10px;
    margin: 0 32px 0 32px;
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