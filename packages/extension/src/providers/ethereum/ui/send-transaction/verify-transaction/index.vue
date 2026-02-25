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
          <verify-transaction-amount v-if="!isNft" :token="txData.toToken" />
          <verify-transaction-nft v-if="isNft" :item="txData.NFTData!" />
          <verify-transaction-fee :fee="txData.gasFee" />
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
      v-model="isProcessing"
      :is-nft="isNft"
      :to-address="txData.toAddress"
      :network="network"
      :token="txData.toToken"
      :is-done="isSendDone"
      :nft="txData.NFTData"
      :is-window-popup="isWindowPopup"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, ComponentPublicInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CloseIcon from '@action/icons/common/close-icon.vue';
import BaseButton from '@action/components/base-button/index.vue';
import VerifyTransactionNetwork from '@/providers/common/ui/verify-transaction/verify-transaction-network.vue';
import VerifyTransactionAccount from '@/providers/common/ui/verify-transaction/verify-transaction-account.vue';
import VerifyTransactionAmount from '@/providers/common/ui/verify-transaction/verify-transaction-amount.vue';
import VerifyTransactionFee from '@/providers/common/ui/verify-transaction/verify-transaction-fee.vue';
import VerifyTransactionNft from '@/providers/common/ui/send-transaction/verify-transaction-nft.vue';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import SendProcess from '@action/views/send-process/index.vue';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { VerifyTransactionParams } from '../../types';
import Transaction from '@/providers/ethereum/libs/transaction';
import Web3Eth from 'web3-eth';
import { getCurrentContext } from '@/libs/messenger/extension';
import { DEFAULT_EVM_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { TransactionSigner } from '../../libs/signer';
import { ActivityStatus, Activity, ActivityType } from '@/types/activity';
import ActivityState from '@/libs/activity-state';
import { EnkryptAccount } from '@enkryptcom/types';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import broadcastTx from '@/providers/ethereum/libs/tx-broadcaster';
import { BaseNetwork } from '@/types/base-network';
import { bigIntToHex } from '@ethereumjs/util';
import { toBN } from 'web3-utils';
import { bufferToHex, toBase } from '@enkryptcom/utils';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import RateState from '@/libs/rate-state';
import { useRateStore } from '@action/store/rate-store';

/** -------------------
 * Rate
 -------------------*/
const rateStore = useRateStore();
const { toggleRatePopup } = rateStore;

const KeyRing = new PublicKeyRing();
const route = useRoute();
const router = useRouter();
const rateState = new RateState();
const selectedNetwork: string = route.query.id as string;
const txData: VerifyTransactionParams = JSON.parse(
  Buffer.from(route.query.txData as string, 'base64').toString('utf8'),
);
const isNft = ref(txData.isNFT);
const isProcessing = ref(false);
const network = ref<BaseNetwork>(DEFAULT_EVM_NETWORK);
const isSendDone = ref(false);
const account = ref<EnkryptAccount>();
const isPopup: boolean = getCurrentContext() === 'new-window';
const verifyScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const isWindowPopup = ref(false);
const errorMsg = ref('');
defineExpose({ verifyScrollRef });
onBeforeMount(async () => {
  network.value = (await getNetworkByName(selectedNetwork))!;
  trackSendEvents(SendEventType.SendVerify, { network: network.value.name });
  account.value = await KeyRing.getAccount(txData.fromAddress);
  isWindowPopup.value = account.value.isHardware;
});
const close = () => {
  if (getCurrentContext() === 'popup') {
    router.go(-1);
  } else {
    window.close();
  }
};

const callToggleRate = () => {
  /**
   * will only show the user if they haven't rated it
   * and never been shown before
   */
  rateState.showPopup(true).then(show => {
    if (show) toggleRatePopup(true);
  });
};

const sendAction = async () => {
  isProcessing.value = true;
  trackSendEvents(SendEventType.SendApprove, {
    network: network.value.name,
  });
  const web3 = new Web3Eth(network.value.node);
  const tx = new Transaction(txData.TransactionData, web3);

  const txActivity: Activity = {
    from: txData.fromAddress,
    to: txData.toAddress,
    isIncoming: txData.fromAddress === txData.toAddress,
    network: network.value.name,
    status: ActivityStatus.pending,
    timestamp: new Date().getTime(),
    token: {
      decimals: isNft.value ? 0 : txData.toToken.decimals,
      icon: isNft.value ? txData.NFTData!.image : txData.toToken.icon,
      name: isNft.value ? txData.NFTData!.name : txData.toToken.name,
      symbol: isNft.value
        ? txData.NFTData!.collectionName
        : txData.toToken.symbol,
      price: isNft.value ? '0' : txData.toToken.price,
    },
    type: ActivityType.transaction,
    value: isNft.value ? '1' : txData.toToken.amount,
    transactionHash: '',
  };
  const activityState = new ActivityState();
  await tx
    .getFinalizedTransaction({
      gasPriceType: txData.gasPriceType,
      totalGasPrice: toBN(
        toBase(txData.gasFee.nativeValue, network.value.decimals),
      ),
    })
    .then(async finalizedTx => {
      const onHash = (hash: string) => {
        trackSendEvents(SendEventType.SendComplete, {
          network: network.value.name,
        });
        activityState.addActivities(
          [
            {
              ...txActivity,
              ...{
                transactionHash: hash,
                nonce: bigIntToHex(finalizedTx.nonce),
              },
            },
          ],
          { address: txData.fromAddress, network: network.value.name },
        );
        isSendDone.value = true;
        if (getCurrentContext() === 'popup') {
          setTimeout(() => {
            isProcessing.value = false;
            callToggleRate();
            router.go(-2);
          }, 4500);
        } else {
          setTimeout(() => {
            isProcessing.value = false;
            callToggleRate();
            window.close();
          }, 1500);
        }
      };
      TransactionSigner({
        account: account.value!,
        network: network.value,
        payload: finalizedTx,
      })
        .then(signedTx => {
          broadcastTx(bufferToHex(signedTx.serialize()), network.value.name)
            .then(onHash)
            .catch(() => {
              web3
                .sendSignedTransaction(bufferToHex(signedTx.serialize()))
                .on('transactionHash', onHash)
                .on('error', (error: any) => {
                  txActivity.status = ActivityStatus.failed;
                  activityState.addActivities([txActivity], {
                    address: txData.fromAddress,
                    network: network.value.name,
                  });
                  isProcessing.value = false;
                  errorMsg.value = error.message;
                  trackSendEvents(SendEventType.SendFailed, {
                    network: network.value.name,
                    error: errorMsg.value,
                  });
                  console.error('ERROR', error);
                });
            });
        })
        .catch(e => {
          isProcessing.value = false;
          errorMsg.value = e.error ? e.error.message : e.message;
          trackSendEvents(SendEventType.SendFailed, {
            network: network.value.name,
            error: errorMsg.value,
          });
          console.error(e);
        });
    });
};
const isHasScroll = () => {
  if (verifyScrollRef.value) {
    return verifyScrollRef.value.$el.classList.contains('ps--active-y');
  }

  return false;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.container {
  width: 100%;
  height: 600px;
  margin: 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 180px;
    pointer-events: none;
    z-index: 0;
  }

  &.popup {
    box-shadow: none;
    padding: 0 23px;
  }
}

.verify-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  animation: fadeInUp 300ms ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &__header {
    position: relative;
    padding: 20px 72px 8px 24px;

    &.popup {
      padding: 24px 0 12px 0;
    }

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 22px;
      line-height: 28px;
      color: @primaryLabel;
      margin: 0;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  &__close {
    position: absolute;
    top: 14px;
    right: 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 200ms ease-in-out;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__description {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: @secondaryLabel;
    padding: 4px 24px 16px 24px;
    margin: 0;

    &.popup {
      padding: 4px 0 16px 0;
    }
  }

  &__info {
    background: @white;
    border: 1.5px solid rgba(0, 0, 0, 0.06);
    box-sizing: border-box;
    border-radius: 16px;
    margin: 0 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    animation: infoFadeIn 400ms ease-out 100ms backwards;

    @keyframes infoFadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    &.popup {
      margin: 0;
      margin-bottom: 56px;
    }
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 16px 24px 24px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    gap: 12px;
    z-index: 10;

    &.popup {
      padding: 24px 0;
      background: @white;
      box-shadow: none !important;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    &.border {
      box-shadow:
        0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);
    }

    &-cancel {
      flex: 1;
      min-width: 0;

      :deep(.base-button) {
        border: 1.5px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        font-weight: 600;
        transition: all 200ms ease-in-out;

        &:hover:not(:disabled) {
          border-color: rgba(0, 0, 0, 0.2);
          background: rgba(0, 0, 0, 0.02);
        }
      }
    }

    &-send {
      flex: 1.4;
      min-width: 0;

      :deep(.base-button) {
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(98, 126, 234, 0.3);
        transition: all 200ms ease-in-out;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(98, 126, 234, 0.4);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }

        &:disabled {
          background: #e2e8f0;
          box-shadow: none;
        }
      }
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: calc(~'100% + 53px');
    height: calc(~'100% - 88px');
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
