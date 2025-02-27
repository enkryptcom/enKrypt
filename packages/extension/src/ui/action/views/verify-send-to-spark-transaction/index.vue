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
          <verify-transaction-fee :fee="txData.gasFee" />
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
      :to-address="txData.toAddress"
      :network="network"
      :token="txData.toToken"
      :is-done="isSendDone"
      :is-window-popup="isWindowPopup"
    />
  </div>
</template>

<script setup lang="ts">
import ActivityState from '@/libs/activity-state';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { getCurrentContext } from '@/libs/messenger/extension';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import { getMintTxData } from '@/libs/spark-handler/getMintTxData';
import { getTotalMintedAmount } from '@/libs/spark-handler/getTotalMintedAmount';
import { DEFAULT_BTC_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import FiroAPI from '@/providers/bitcoin/libs/api-firo';
import {
  FiroWallet,
  validator,
} from '@/providers/bitcoin/libs/firo-wallet/firo-wallet';
import { isAddress } from '@/providers/bitcoin/libs/utils';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import { VerifyTransactionParams } from '@/providers/bitcoin/ui/types';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import VerifyTransactionAccount from '@/providers/common/ui/verify-transaction/verify-transaction-account.vue';
import VerifyTransactionAmount from '@/providers/common/ui/verify-transaction/verify-transaction-amount.vue';
import VerifyTransactionFee from '@/providers/common/ui/verify-transaction/verify-transaction-fee.vue';
import VerifyTransactionNetwork from '@/providers/common/ui/verify-transaction/verify-transaction-network.vue';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import BaseButton from '@action/components/base-button/index.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import CloseIcon from '@action/icons/common/close-icon.vue';
import SendProcess from '@action/views/send-process/index.vue';
import { EnkryptAccount } from '@enkryptcom/types';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { ComponentPublicInstance, inject, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const emits = defineEmits<{
  (e: 'update:spark-state-changed', network: BaseNetwork): void;
}>();

const KeyRing = new PublicKeyRing();
const route = useRoute();
const router = useRouter();
const selectedNetwork: string = route.query.id as string;
const txData: VerifyTransactionParams = JSON.parse(
  Buffer.from(route.query.txData as string, 'base64').toString('utf8'),
);

const isProcessing = ref(false);
const network = ref<BitcoinNetwork>(DEFAULT_BTC_NETWORK);
const isSendDone = ref(false);
const account = ref<EnkryptAccount>();
const isPopup: boolean = getCurrentContext() === 'new-window';
const verifyScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const isWindowPopup = ref(false);
const errorMsg = ref('');

const wasmModule = inject<WasmModule>('wasmModule');

defineExpose({ verifyScrollRef });

onBeforeMount(async () => {
  network.value = (await getNetworkByName(selectedNetwork)!) as BitcoinNetwork;
  trackSendEvents(SendEventType.SendVerify, { network: network.value.name });
  if (isAddress(txData.fromAddress, network.value.networkInfo)) {
    account.value = await KeyRing.getAccount(txData.fromAddress);
    isWindowPopup.value = account.value.isHardware;
  }
});

const close = () => {
  if (getCurrentContext() === 'popup') {
    router.go(-1);
  } else {
    window.close();
  }
};

const sendAction = async () => {
  isProcessing.value = true;
  trackSendEvents(SendEventType.SendApprove, {
    network: network.value.name,
  });

  const wallet = new FiroWallet();
  await wallet.setSecret(txData.mnemonic!);

  const address2Check = await wallet.getTransactionsAddresses();

  const { spendableUtxos, addressKeyPairs } =
    await wallet.getSpendableUtxos(address2Check);

  if (spendableUtxos.length === 0) throw new Error('No UTXOs available!');

  const amountToSendBN = new BigNumber(txData.toToken.amount);

  const feeBn = new BigNumber(500);

  const mintTxData = await getMintTxData({
    wasmModule,
    address: txData.toAddress,
    amount: amountToSendBN.toString(),
  });

  const psbt = new bitcoin.Psbt({ network: network.value.networkInfo });

  const { inputAmountBn, psbtInputs } =
    await getTotalMintedAmount(spendableUtxos);

  psbtInputs.forEach(el => {
    psbt.addInput(el);
  });

  if (inputAmountBn.lt(amountToSendBN.plus(feeBn)))
    throw new Error('❌ Not enough balance!');

  psbt.addOutput({
    script: Buffer.from(mintTxData?.[0]?.scriptPubKey ?? ''),
    value: amountToSendBN.toNumber(),
  });

  const changeAmount = inputAmountBn.minus(amountToSendBN).minus(feeBn);

  if (changeAmount.gt(0)) {
    const firstUtxoAddress = spendableUtxos[0].address;
    console.log(
      `🔹 Sending Change (${feeBn.toNumber() / 1e8} FIRO) to ${firstUtxoAddress}`,
    );
    psbt.addOutput({
      address: firstUtxoAddress!,
      value: changeAmount.toNumber(),
    });
  }

  for (let index = 0; index < spendableUtxos.length; index++) {
    const utxo = spendableUtxos[index];
    const keyPair = addressKeyPairs[utxo.address];

    console.log(
      `🔹 Signing input ${index} with key ${keyPair.publicKey.toString('hex')}`,
    );

    const Signer = {
      sign: (hash: Uint8Array) => {
        return Buffer.from(keyPair.sign(hash));
      },
      publicKey: Buffer.from(keyPair.publicKey),
    } as unknown as bitcoin.Signer;

    psbt.signInput(index, Signer);
    console.log(`🔹 Siged input ${index}`);
  }

  if (!psbt.validateSignaturesOfAllInputs(validator)) {
    throw new Error('Error: Some inputs were not signed!');
  }

  psbt.finalizeAllInputs();

  const rawTx = psbt.extractTransaction().toHex();
  console.log('Raw Mint Transaction:', rawTx);

  const txActivity: Activity = {
    from: network.value.displayAddress(txData.fromAddress),
    to: txData.toAddress,
    isIncoming: txData.fromAddress === txData.toAddress,
    network: network.value.name,
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
    transactionHash: '',
  };

  const activityState = new ActivityState();

  const api = (await network.value.api()) as unknown as FiroAPI;

  api
    .broadcastTx(rawTx)
    .then(({ txid }) => {
      trackSendEvents(SendEventType.SendComplete, {
        network: network.value.name,
      });
      activityState.addActivities(
        [
          {
            ...txActivity,
            ...{ transactionHash: txid },
          },
        ],
        {
          address: network.value.displayAddress(txData.fromAddress),
          network: network.value.name,
        },
      );
      isSendDone.value = true;
      if (getCurrentContext() === 'popup') {
        setTimeout(() => {
          isProcessing.value = false;
          router.go(-2);
        }, 4500);
      } else {
        setTimeout(() => {
          isProcessing.value = false;
          window.close();
        }, 1500);
      }
    })
    .catch(error => {
      trackSendEvents(SendEventType.SendFailed, {
        network: network.value.name,
        error: error.message,
      });
      txActivity.status = ActivityStatus.failed;
      activityState.addActivities([txActivity], {
        address: txData.fromAddress,
        network: network.value.name,
      });

      isProcessing.value = false;
      errorMsg.value = JSON.stringify(error);
      console.error('ERROR', error);
    });

  // await sendToSparkAddress(
  //   txData.toAddress,
  //   fromBase(txData.toToken.amount, txData.toToken.decimals).toString()
  // )
  //   .then(() => {
  //     trackSendEvents(SendEventType.SendComplete, {
  //       network: network.value.name,
  //     });
  //     isSendDone.value = true;
  //     if (getCurrentContext() === "popup") {
  //       setTimeout(() => {
  //         isProcessing.value = false;
  //         router.go(-2);
  //       }, 4500);
  //     } else {
  //       setTimeout(() => {
  //         isProcessing.value = false;
  //         window.close();
  //       }, 1500);
  //     }
  //     emits("update:spark-state-changed", network.value);
  //   })
  //   .catch((error) => {
  //     isProcessing.value = false;

  //     if (isAxiosError(error)) {
  //       errorMsg.value = JSON.stringify(error.response?.data.error.message);
  //     } else {
  //       errorMsg.value = JSON.stringify(error);
  //     }

  //     trackSendEvents(SendEventType.SendFailed, {
  //       network: network.value.name,
  //       error: error.message,
  //     });
  //     txActivity.status = ActivityStatus.failed;
  //     activityState.addActivities([txActivity], {
  //       address: txData.fromAddress,
  //       network: network.value.name,
  //     });
  //     console.error("ERROR", error);
  //   });
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
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;

  &.popup {
    box-shadow: none;
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
      box-shadow:
        0px 0px 6px rgba(0, 0, 0, 0.05),
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
