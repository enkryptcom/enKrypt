<template>
  <div class="container" :class="{ popup: isPopup }">
    <div v-if="!!selectedNetwork" class="verify-transaction">
      <custom-scrollbar
        ref="verifyScrollRef"
        class="verify-transaction__scroll-area"
      >
        <div class="verify-transaction__header" :class="{ popup: isPopup }">
          <h3>Verify Transaction</h3>
          <a v-if="!isPopup" class="verify-transaction__close" @click="close">
            <close-icon />
          </a>
        </div>
        <hardware-wallet-msg :wallet-type="account?.walletType" />
        <p
          class="verify-transaction__description"
          style="color: red"
          :class="{ popup: isPopup }"
        >
          {{ errorMsg }}
        </p>
        <p class="verify-transaction__description" :class="{ popup: isPopup }">
          Double check the information and confirm transaction
        </p>
        <div
          class="verify-transaction__info"
          :class="{ popup: isPopup, border: isHasScroll() }"
        >
          <verify-transaction-network :network="network" />
          <verify-transaction-account
            :name="txData.fromAddressName"
            :address="network.displayAddress(txData.fromAddress)"
            :from="true"
            :network="network"
          />
          <verify-transaction-account
            :address="network.displayAddress(txData.toAddress)"
            :network="network"
          />
          <verify-transaction-amount :token="txData.toToken" />
          <verify-transaction-fee :fee="txData.txFee" />
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
      :is-done="isSendDone"
      :is-nft="false"
      :to-address="txData.toAddress"
      :network="network"
      :token="txData.toToken"
      :is-window-popup="isWindowPopup"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, ComponentPublicInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import VerifyTransactionNetwork from "@/providers/common/ui/verify-transaction/verify-transaction-network.vue";
import VerifyTransactionAccount from "@/providers/common/ui/verify-transaction/verify-transaction-account.vue";
import VerifyTransactionAmount from "@/providers/common/ui/verify-transaction/verify-transaction-amount.vue";
import VerifyTransactionFee from "@/providers/common/ui/verify-transaction/verify-transaction-fee.vue";
import HardwareWalletMsg from "@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue";
import SendProcess from "@action/views/send-process/index.vue";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { getCurrentContext } from "@/libs/messenger/extension";
import { VerifyTransactionParams } from "../../types";
import {
  DEFAULT_KADENA_NETWORK,
  getNetworkByName,
} from "@/libs/utils/networks";
import { EnkryptAccount } from "@enkryptcom/types";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { BaseNetwork } from "@/types/base-network";
import ActivityState from "@/libs/activity-state";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { KDAToken } from "@/providers/kadena/types/kda-token";
import KadenaAPI from "@/providers/kadena/libs/api";
import { KadenaNetwork } from "@/providers/kadena/types/kadena-network";

const isSendDone = ref(false);
const account = ref<EnkryptAccount>();
const chainId = ref<string>();
const kdaToken = ref<KDAToken>();
const KeyRing = new PublicKeyRing();
const route = useRoute();
const router = useRouter();
const selectedNetwork: string = route.query.id as string;
const txData: VerifyTransactionParams = JSON.parse(
  Buffer.from(route.query.txData as string, "base64").toString("utf8")
);
const errorMsg = ref("");
const isProcessing = ref(false);
const isPopup: boolean = getCurrentContext() === "new-window";
const isWindowPopup = ref(false);
const verifyScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
defineExpose({ verifyScrollRef });
const network = ref<BaseNetwork>(DEFAULT_KADENA_NETWORK);

onBeforeMount(async () => {
  network.value = (await getNetworkByName(selectedNetwork))!;
  account.value = await KeyRing.getAccount(txData.fromAddress);
  chainId.value = txData.chainId;
  isWindowPopup.value = account.value.isHardware;
  kdaToken.value = new KDAToken({
    icon: network.value.icon,
    balance: "0",
    price: "0",
    name: "loading",
    symbol: "loading",
    decimals: network.value.decimals,
  });
});
const close = () => {
  if (getCurrentContext() === "popup") {
    router.go(-1);
  } else {
    window.close();
  }
};

const sendAction = async () => {
  isProcessing.value = true;

  try {
    const transaction = await kdaToken.value!.buildTransaction!(
      txData.toAddress,
      account.value!,
      txData.TransactionData.value,
      network.value as KadenaNetwork,
      chainId.value!
    );

    const networkApi = (await network.value.api()) as KadenaAPI;
    const transactionDescriptor = await networkApi.sendTransaction(
      transaction,
      chainId.value!
    );

    const txActivity: Activity = {
      from: network.value.displayAddress(txData.fromAddress),
      to: network.value.displayAddress(txData.toAddress),
      isIncoming: txData.fromAddress === txData.toAddress,
      network: network.value.name,
      status: ActivityStatus.pending,
      chainId: chainId.value!,
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
      transactionHash: transactionDescriptor.requestKey,
    };

    const activityState = new ActivityState();

    await activityState.addActivities([txActivity], {
      address: network.value.displayAddress(txData.fromAddress),
      network: network.value.name,
    });

    isSendDone.value = true;

    if (getCurrentContext() === "popup") {
      setTimeout(() => {
        isProcessing.value = false;
        router.push({ name: "activity", params: { id: network.value.name } });
      }, 2500);
    } else {
      setTimeout(() => {
        isProcessing.value = false;
        window.close();
      }, 1500);
    }
  } catch (error: any) {
    isProcessing.value = false;
    console.error("error", error);
    errorMsg.value = `Error: ${
      error.message || "Could not send the transaction"
    }`;
  }
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

  &.popup {
    box-shadow: none;
    padding: 0 23px;
  }
}

.verify-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

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
    padding: 8px 32px 32px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    font-size: 0;

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
