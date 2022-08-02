<template>
  <div class="container" :class="{ popup: isPopup }">
    <div v-if="!!selectedNetwork" class="verify-transaction">
      <custom-scrollbar
        ref="verifyScrollRef"
        class="verify-transaction__scroll-area"
      >
        <div class="verify-transaction__header" :class="{ popup: isPopup }">
          <h3>Verify Transaction</h3>
        </div>
        <hardware-wallet-msg
          :wallet-type="account?.walletType"
        ></hardware-wallet-msg>
        <p class="verify-transaction__description" :class="{ popup: isPopup }">
          Double check the information and confirm transaction
        </p>
        <div
          class="verify-transaction__info"
          :class="{ popup: isPopup, border: isHasScroll() }"
        >
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
          {{ errorMsg }}
        </div>
      </custom-scrollbar>

      <div
        class="verify-transaction__buttons"
        :class="{ popup: isPopup, border: isHasScroll() }"
      >
        <div class="verify-transaction__buttons-cancel">
          <base-button
            title="Back"
            :click="close"
            :gray="true"
            :disabled="isProcessing"
          />
        </div>
        <div class="verify-transaction__buttons-send">
          <base-button
            title="Confirm and send"
            :click="sendAction"
            :disabled="isProcessing"
          />
        </div>
      </div>
    </div>

    <send-process
      v-if="isProcessing"
      :is-nft="isNft"
      :to-address="txData.toAddress"
      :network="network"
      :token="txData.toToken"
      :is-done="isSendDone"
      :is-window-popup="isWindowPopup"
    ></send-process>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, ComponentPublicInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseButton from "@action/components/base-button/index.vue";
import VerifyTransactionNetwork from "./components/verify-transaction-network.vue";
import VerifyTransactionAccount from "./components/verify-transaction-account.vue";
import VerifyTransactionAmount from "./components/verify-transaction-amount.vue";
import VerifyTransactionFee from "./components/verify-transaction-fee.vue";
import VerifyTransactionNft from "./components/verify-transaction-nft.vue";
import HardwareWalletMsg from "../../components/hardware-wallet-msg.vue";
import SendProcess from "@action/views/send-process/index.vue";
import { nft } from "@action/types/mock";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { VerifyTransactionParams } from "../../types";
import Transaction from "@/providers/ethereum/libs/transaction";
import Web3 from "web3";
import { getCurrentContext } from "@/libs/messenger/extension";
import { getNetworkByName } from "@/libs/utils/networks";
import { TransactionSigner } from "../../libs/signer";
import { ActivityStatus, Activity, ActivityType } from "@/types/activity";
import ActivityState from "@/libs/activity-state";
import { EnkryptAccount } from "@enkryptcom/types";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";

interface IProps {
  networkId?: string;
  txData?: string;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
  (e: "update:close"): void;
}>();

const KeyRing = new PublicKeyRing();
const route = useRoute();
const router = useRouter();
const selectedNetwork: string = props.networkId
  ? props.networkId
  : (route.query.id as string);
const txData: VerifyTransactionParams = props.txData
  ? JSON.parse(Buffer.from(props.txData, "base64").toString("utf8"))
  : JSON.parse(
      Buffer.from(route.query.txData as string, "base64").toString("utf8")
    );
const isNft = false;
const isProcessing = ref(false);
const network = getNetworkByName(selectedNetwork)!;
const isSendDone = ref(false);
const account = ref<EnkryptAccount>();
const isPopup: boolean = getCurrentContext() === "new-window";
const verifyScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const isWindowPopup = ref(false);
const errorMsg = ref("");
defineExpose({ verifyScrollRef });
onBeforeMount(async () => {
  account.value = await KeyRing.getAccount(txData.fromAddress);
  isWindowPopup.value = account.value.isHardware;
});
const close = () => {
  if (getCurrentContext() === "popup") {
    emits("update:close");
  } else {
    window.close();
  }
};

console.log("current context", getCurrentContext());

const sendAction = async () => {
  isProcessing.value = true;
  const web3 = new Web3(network.node);
  const tx = new Transaction(txData.TransactionData, web3);

  const txActivity: Activity = {
    from: txData.fromAddress,
    to: txData.toAddress,
    isIncoming: txData.fromAddress === txData.toAddress,
    network: network.name,
    status: ActivityStatus.pending,
    timestamp: new Date().getTime(),
    token: {
      decimals: txData.toToken.decimals,
      icon: txData.toToken.icon,
      name: txData.toToken.name,
      symbol: txData.toToken.symbol,
      price: txData.toToken.price,
    },
    type: ActivityType.transaction,
    value: txData.toToken.amount,
    transactionHash: "",
  };
  const activityState = new ActivityState();
  await tx
    .getFinalizedTransaction({ gasPriceType: txData.gasPriceType })
    .then(async (finalizedTx) => {
      TransactionSigner({
        account: account.value!,
        network,
        payload: finalizedTx,
      })
        .then((signedTx) => {
          web3.eth
            .sendSignedTransaction("0x" + signedTx.serialize().toString("hex"))
            .on("transactionHash", (hash: string) => {
              activityState.addActivities(
                [{ ...txActivity, ...{ transactionHash: hash } }],
                { address: txData.fromAddress, network: network.name }
              );
              isSendDone.value = true;
              if (getCurrentContext() === "popup") {
                setTimeout(() => {
                  isProcessing.value = false;
                  router.go(-1);
                }, 4500);
              } else {
                setTimeout(() => {
                  isProcessing.value = false;
                  window.close();
                }, 1500);
              }
            })
            .on("error", (error: any) => {
              txActivity.status = ActivityStatus.failed;
              activityState.addActivities([txActivity], {
                address: txData.fromAddress,
                network: network.name,
              });
              console.error("ERROR", error);
            });
        })
        .catch((error) => {
          isProcessing.value = false;
          console.error("error", error);
          errorMsg.value = JSON.stringify(error);
        });
    });
};
const isHasScroll = () => {
  if (verifyScrollRef.value) {
    return verifyScrollRef.value.$el.classList.contains("ps--active-y");
  }

  return false;
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
  position: absolute !important;
  top: 0px;
  z-index: 10;

  &.popup {
    box-shadow: none;
    position: relative !important;
  }
}

.verify-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    &.popup {
      padding: 24px 0 12px 0;
    }

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

    &.popup {
      padding: 4px 0 16px 0;
    }
  }

  &__info {
    border: 1px solid @gray02;
    box-sizing: border-box;
    border-radius: 10px;
    margin: 0 32px 0 32px;

    &.popup {
      margin: 0;
      margin-bottom: 56px;
    }
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

    &.popup {
      padding: 24px;
      background: @white;
    }

    &.border {
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);
    }

    &-cancel {
      width: 170px;
    }

    &-send {
      width: 218px;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: calc(~"100% + 53px");
    height: calc(~"100% - 88px");
    margin: 0;
    padding: 0 53px 0 0 !important;
    margin-right: -53px;
    box-sizing: border-box;

    &.ps--active-y {
      padding-bottom: 0 !important;
    }

    & > .ps__rail-y {
      right: 0 !important;
    }
  }
}
</style>
