<template>
  <div class="container">
    <div v-if="!!selectedNetwork" class="verify-transaction">
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
        <verify-transaction-amount :token="txData.toToken">
        </verify-transaction-amount>
        <verify-transaction-fee :fee="txData.txFee"></verify-transaction-fee>
      </div>

      <div class="verify-transaction__buttons">
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
    ></send-process>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import VerifyTransactionNetwork from "./components/verify-transaction-network.vue";
import VerifyTransactionAccount from "./components/verify-transaction-account.vue";
import VerifyTransactionAmount from "./components/verify-transaction-amount.vue";
import VerifyTransactionFee from "./components/verify-transaction-fee.vue";
import SendProcess from "@action/views/send-process/index.vue";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { getCurrentContext } from "@/libs/messenger/extension";
import { VerifyTransactionParams } from "@/providers/polkadot/ui/types";
import { ApiPromise } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import type { SignerResult } from "@polkadot/api/types";
import { getNetworkByName } from "@/libs/utils/networks";
import { TypeRegistry } from "@polkadot/types";
import { TransactionSigner } from "../../libs/signer";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import ActivityState from "@/libs/activity-state";
const isSendDone = ref(false);

const KeyRing = new PublicKeyRing();
const route = useRoute();
const router = useRouter();
const selectedNetwork: string = route.query.id as string;
const txData: VerifyTransactionParams = JSON.parse(
  route.query.txData as string
);

const isProcessing = ref(false);

const network = getNetworkByName(selectedNetwork)!;

const close = () => {
  if (getCurrentContext() === "popup") {
    router.go(-1);
  } else {
    window.close();
  }
};

const sendAction = async () => {
  isProcessing.value = true;
  const api = await network.api();
  await api.init();

  const account = await KeyRing.getAccount(txData.fromAddress);

  const tx = (api.api as ApiPromise).tx(txData.TransactionData.data);

  try {
    const signedTx = await tx.signAsync(account.address, {
      signer: {
        signPayload: (signPayload): Promise<SignerResult> => {
          const registry = new TypeRegistry();
          registry.setSignedExtensions(signPayload.signedExtensions);
          const extType = registry.createType("ExtrinsicPayload", signPayload, {
            version: signPayload.version,
          });
          return TransactionSigner({
            account: account,
            network: network,
            payload: extType,
          }).then((res) => {
            if (res.error) return Promise.reject(res.error);
            else
              return {
                id: 0,
                signature: JSON.parse(res.result as string),
              };
          });
        },
      },
    });
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
    signedTx
      .send()
      .then(async (hash) => {
        txActivity.transactionHash = u8aToHex(hash);
        await activityState.addActivities([txActivity], {
          address: network.displayAddress(txData.fromAddress),
          network: network.name,
        });
      })
      .catch(() => {
        txActivity.status = ActivityStatus.failed;
        activityState.addActivities([txActivity], {
          address: network.displayAddress(txData.fromAddress),
          network: network.name,
        });
      });

    isSendDone.value = true;
    if (getCurrentContext() === "popup") {
      setTimeout(() => {
        isProcessing.value = false;
        router.go(-2);
      }, 2500);
    } else {
      setTimeout(() => {
        isProcessing.value = false;
        window.close();
      }, 1500);
    }
  } catch (error) {
    console.error("error", error);
  }
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
