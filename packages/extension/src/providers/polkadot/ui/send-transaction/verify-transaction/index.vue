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
        <verify-transaction-fee :fee="txData.txFee"></verify-transaction-fee>
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
import SendProcess from "@action/views/send-process/index.vue";
import { nft } from "@action/types/mock";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { BaseNetwork } from "@/types/base-network";
import { sendToBackgroundFromAction } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { VerifyTransactionParams } from "@/providers/polkadot/ui/types";
import { ApiPromise } from "@polkadot/api";
import { payloadSignTransform } from "@/providers/polkadot/libs/signing-utils";
import { SignerPayloadRaw } from "@polkadot/types/types";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import type { SignerResult } from "@polkadot/api/types";
const KeyRing = new PublicKeyRing();
const route = useRoute();
const router = useRouter();
const selected: string = route.params.id as string;
const txData: VerifyTransactionParams = JSON.parse(
  route.params.txData as string
);
console.log(txData);
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
  const api = await props.network.api();
  await api.init();

  const account = await KeyRing.getAccount(txData.fromAddress);

  const tx = (api.api as ApiPromise).tx(txData.TransactionData.data);

  const signedTx = await tx.signAsync(account.address, {
    signer: {
      signRaw: ({ data }: SignerPayloadRaw): Promise<SignerResult> => {
        console.log(data, hexToU8a(data).length, "data length");
        return sendToBackgroundFromAction({
          message: JSON.stringify({
            method: InternalMethods.sign,
            params: [data, account],
          }),
        }).then((res) => {
          const signed = payloadSignTransform(
            JSON.parse(res.result!),
            account.type,
            true
          );
          return {
            id: 5,
            signature: signed as `0x${string}`,
          };
        });
      },
    },
  });
  const hash = await signedTx.send();
  console.log(u8aToHex(hash));
  isProcessing.value = false;
  // const ext = registry.createType("ExtrinsicPayload", tx, {
  //   version: tx.version,
  // });
  // const signMsg = signPayload(ext);

  // sendToBackgroundFromAction({
  //   message: JSON.stringify({
  //     method: InternalMethods.sign,
  //     params: [signMsg, account],
  //   }),
  // }).then(async (res) => {
  //   if (res.error) {
  //     console.log("error", res);
  //   } else {
  //     console.log("success", {
  //       result: JSON.stringify(res.result),
  //     });

  //     const signed = payloadSignTransform(
  //       JSON.parse(res.result!),
  //       account.type,
  //       true
  //     );
  //     console.log(account.address, JSON.parse(res.result!), signed, signMsg);
  //     tx.addSignature(account.address, signed as `0x{string}`, tx.toU8a());

  //     const hash = await tx.send();
  //     console.log(hash);
  //     // console.log(tx);
  //   }
  // });

  // const reqPayload = txData.TransactionData
  //   .data as unknown as SignerPayloadJSON;
  // registry.setSignedExtensions(reqPayload.signedExtensions);
  // const extType = registry.createType("ExtrinsicPayload", reqPayload, {
  //   version: reqPayload.version,
  // });
  // const signMsg = signPayload(extType);

  // console.log(JSON.parse(txData.TransactionData.data));

  // const web3 = new Web3(props.network.node);
  // const tx = new Transaction(txData.TransactionData, web3);
  // await tx
  //   .getFinalizedTransaction({ gasPriceType: txData.gasPriceType })
  //   .then(async (finalizedTx) => {
  //     const msgHash = bufferToHex(finalizedTx.getMessageToSign(true));
  //     const account = await KeyRing.getAccount(txData.fromAddress);
  //     return sendToBackgroundFromAction({
  //       message: JSON.stringify({
  //         method: InternalMethods.sign,
  //         params: [msgHash, account],
  //       }),
  //     }).then((res: any) => {
  //       if (res.error) {
  //         console.log("error", res.error);
  //       } else {
  //         const rpcSig = fromRpcSig(JSON.parse(res.result) || "0x");
  //         const signedTx = (
  //           finalizedTx as FeeMarketEIP1559Transaction
  //         )._processSignature(rpcSig.v, rpcSig.r, rpcSig.s);
  //         web3.eth
  //           .sendSignedTransaction("0x" + signedTx.serialize().toString("hex"))
  //           .on("transactionHash", (hash: string) => {
  //             console.log("hash", hash);
  //           })
  //           .on("error", (error: any) => {
  //             console.log("ERROR", error);
  //           });
  //       }
  //     });
  //   });
  // setTimeout(() => {
  //   isProcessing.value = false;
  // }, 4000);
  // setTimeout(() => {
  //   router.go(-2);
  // }, 4500);
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
