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
          v-show="!!selectedNetwork"
          :network="selectedNetwork"
        ></verify-transaction-network>
        <verify-transaction-account
          name="My personal account"
          address="0x14502CF6C0A13167Dc2D0E25Dabf5FBDB68C2967"
          :from="true"
        ></verify-transaction-account>
        <verify-transaction-account
          :address="address"
        ></verify-transaction-account>
        <verify-transaction-amount :token="ethereum" :amount="amount">
        </verify-transaction-amount>
        <verify-transaction-fee
          :fee="recommendedFee"
          :amount="1.5"
        ></verify-transaction-fee>
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

    <send-process v-if="isProcessing"></send-process>
  </div>
</template>

<script lang="ts">
export default {
  name: "VerifyTransaction",
};
</script>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import VerifyTransactionNetwork from "./components/verify-transaction-network.vue";
import VerifyTransactionAccount from "./components/verify-transaction-account.vue";
import VerifyTransactionAmount from "./components/verify-transaction-amount.vue";
import VerifyTransactionFee from "./components/verify-transaction-fee.vue";
import SendProcess from "@action/views/send-process/index.vue";
import DomainState from "@/libs/domain-state";
import { NodeType } from "@/types/provider";
import { getAllNetworks } from "@/libs/utils/networks";
import { ethereum, recommendedFee } from "@action/types/mock";
import { EthereumTransaction } from "@/providers/ethereum/libs/transaction/types";
import Web3 from "web3";
import Transaction from "@/providers/ethereum/libs/transaction/";
import { toWei, numberToHex, toChecksumAddress } from "web3-utils";
import { bufferToHex } from "@enkryptcom/utils";
import { sendToBackgroundFromAction } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { KeyRecord } from "@enkryptcom/types";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { fromRpcSig } from "ethereumjs-util";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";

const KeyRing = new PublicKeyRing();
let web3: any;
const domainState = new DomainState();
const route = useRoute();
const router = useRouter();
const networks: NodeType[] = getAllNetworks();
const selected: string = route.params.id as string;
const address: string = route.params.address as string;
const fromAddress: string = route.params.fromAddress as string;
const amount = route.params.amount as unknown as number;
let selectedNetwork = ref<any>(undefined);
let isProcessing = ref(false);

defineExpose({ selectedNetwork });

onMounted(async () => {
  const curNetwork = await domainState.getSelectedNetWork();
  (selectedNetwork.value as unknown as NodeType) = networks.find(
    (net) => net.name === curNetwork
  ) as NodeType;
  web3 = await new Web3(selectedNetwork.value?.node);
});

const close = () => {
  router.go(-1);
};

const sendAction = async () => {
  isProcessing.value = true;

  const txObj = (await setUpTx()) as unknown as EthereumTransaction;
  const tx = await new Transaction(txObj, web3);

  await tx.getFinalizedTransaction().then(async (finalizedTx) => {
    const msgHash = bufferToHex(finalizedTx.getMessageToSign(true));
    const account = await KeyRing.getAccount(fromAddress);

    return await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: InternalMethods.sign,
        params: [msgHash, account as KeyRecord],
      }),
      provider: selectedNetwork.value?.provider,
      tabId: await domainState.getCurrentTabId(),
    }).then((res: any) => {
      if (res.error) {
        console.log("error", res.error);
      } else {
        const rpcSig = fromRpcSig(res.result.replace(/['"]+/g, "") || "0x");
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

const getNonce = async () => {
  return await web3.eth.getTransactionCount(fromAddress);
};

const estimateGas = async () => {
  return web3.eth.getGasPrice().then((data: string) => {
    return numberToHex(data);
  });
};

const setUpTx = async () => {
  const value = numberToHex(toWei(amount.toString()));
  const nonce = await getNonce();
  const gasPrice = await estimateGas();
  return {
    from: toChecksumAddress(fromAddress),
    to: toChecksumAddress(address),
    value: value,
    gas: "0x5208", // 21000
    gasPrice: gasPrice,
    data: `0x`,
    // gasLimit: `0x${}`,
    nonce: `0x${nonce}`,
    chainId: `0x${selectedNetwork.value?.chainID}`, // 1
  };
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
