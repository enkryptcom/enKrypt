<template>
  <component
    :is="isWindowPopup ? 'div' : AppDialog"
    v-model="model"
    is-centered
    width="320px"
  >
    <div
      :class="{
        'anonymize-state__container anonymize-state__container__popup':
          isWindowPopup,
      }"
    >
      <div class="anonymize-state">
        <div class="anonymize-state__wrap">
          <div class="anonymize-state__checks">
            <div class="anonymize-state__checks__item">
              <done-icon
                v-if="!isCoinSyncing"
                class="anonymize-state__checks__item__checked"
              />
              <info-icon
                v-else
                class="anonymize-state__checks__item__pending"
              />
              <span v-if="!isCoinSyncing">Coins synchronized</span>
              <span v-else>Coins synchronizing...</span>
            </div>
            <div class="anonymize-state__checks__item">
              <done-icon
                v-if="!isTagSyncing"
                class="anonymize-state__checks__item__checked"
              />
              <info-icon
                v-else
                class="anonymize-state__checks__item__pending"
              />
              <span v-if="!isTagSyncing">Tags synchronized</span>
              <span v-else>Tags synchronizing...</span>
            </div>

            <button
              :disabled="isAnonymizeBtnDisabled || isAnonymizeBtnLoading"
              v-if="network.name === NetworkNames.Firo && sparkAccount"
              class="btn__anonymize"
              :class="{ 'btn__anonymize-error': !!errorMsg }"
              @click="anonymizeFunds()"
            >
              <loader
                v-show="isAnonymizeBtnLoading"
                class="btn__anonymize__loading"
              />
              Anonymize funds
            </button>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import AppDialog from '@action/components/app-dialog/index.vue';
import DoneIcon from '@action/icons/common/done_icon.vue';
import InfoIcon from '@action/icons/common/info-icon.vue';
import { computed, PropType, ref } from 'vue';
import { AccountsHeaderData, SparkAccount } from '@action/types/account';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import Loader from '@action/icons/common/loader.vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import {
  BaseFiroWallet,
  validator,
} from '@/providers/bitcoin/libs/firo-wallet/base-firo-wallet';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { wasmInstance } from '@/libs/utils/wasm-loader';
import FiroAPI from '@/providers/bitcoin/libs/api-firo';
import { getMintTxData } from '@/libs/spark-handler/getMintTxData';
import { getTotalMintedAmount } from '@/libs/spark-handler/getTotalMintedAmount';
import { createTempTx } from '@/libs/spark-handler/createTempTx';
import { getFee } from '@/libs/spark-handler/getFee';
import MarketData from '@/libs/market-data';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import ActivityState from '@/libs/activity-state';
import { SendEventType } from '@/libs/metrics/types';
import { trackSendEvents } from '@/libs/metrics';

const props = defineProps({
  isCoinSyncing: {
    type: Boolean,
    default: false,
  },
  isTagSyncing: {
    type: Boolean,
    default: false,
  },
  network: {
    type: Object as PropType<BitcoinNetwork>,
    default: () => ({}),
  },
  sparkAccount: {
    type: Object as PropType<SparkAccount | null>,
    default: () => {
      return {};
    },
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
  cryptoAmount: {
    type: String,
    default: '0',
  },
  isWindowPopup: Boolean,
});

const model = defineModel<boolean>();

const wallet = new BaseFiroWallet();

const isTransferLoading = ref(false);
const errorMsg = ref();

const isAnonymizeBtnDisabled = computed(() => {
  return (
    props.isCoinSyncing || props.isTagSyncing || Number(props.cryptoAmount) <= 0
  );
});

const isAnonymizeBtnLoading = computed(() => isTransferLoading.value);

const anonymizeFunds = async () => {
  isTransferLoading.value = true;
  errorMsg.value = undefined;
  if (!props.sparkAccount) return;

  const wasmModule = await wasmInstance.getInstance();
  const address2Check = await wallet.getTransactionsAddresses();

  const { spendableUtxos, addressKeyPairs } =
    await wallet.getSpendableUtxos(address2Check);

  if (spendableUtxos.length === 0) throw new Error('No UTXOs available!');

  const amountToSend = spendableUtxos.reduce((a, c) => {
    return (a += c.satoshis);
  }, 0);

  const amountToSendBN = new BigNumber(amountToSend);

  const mintTxData = await getMintTxData({
    wasmModule,
    address: props.sparkAccount.defaultAddress,
    amount: amountToSendBN.toString(),
    utxos: spendableUtxos.map(({ txid, vout }) => ({
      txHash: Buffer.from(txid),
      vout,
      txHashLength: txid.length,
    })),
  });

  const psbt = new bitcoin.Psbt({ network: props.network.networkInfo });

  const { inputAmountBn, psbtInputs } =
    await getTotalMintedAmount(spendableUtxos);

  const tempTx = createTempTx({
    changeAmount: inputAmountBn.minus(amountToSendBN).minus(new BigNumber(500)),
    network: props.network.networkInfo,
    addressKeyPairs,
    spendableUtxos,
    mintValueOutput: [
      {
        script: Buffer.from(mintTxData?.[0]?.scriptPubKey ?? '', 'hex'),
        value: amountToSendBN.toNumber(),
      },
    ],
    inputs: psbtInputs,
  });

  const feeBn = await getFee(tempTx);

  psbtInputs.forEach(el => {
    psbt.addInput(el);
  });

  psbt.addOutput({
    script: Buffer.from(mintTxData?.[0]?.scriptPubKey ?? '', 'hex'),
    value: amountToSendBN.minus(feeBn).toNumber(),
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

    const Signer = {
      sign: (hash: Uint8Array) => {
        return Buffer.from(keyPair.sign(hash));
      },
      publicKey: Buffer.from(keyPair.publicKey),
    } as unknown as bitcoin.Signer;

    psbt.signInput(index, Signer);
  }

  if (!psbt.validateSignaturesOfAllInputs(validator)) {
    throw new Error('Error: Some inputs were not signed!');
  }

  psbt.finalizeAllInputs();

  const rawTx = psbt.extractTransaction().toHex();
  console.log('Raw Mint Transaction:', rawTx);

  const fromAddress = props.accountInfo.selectedAccount?.address ?? '';

  let tokenPrice = '0';

  if (props.network.coingeckoID) {
    const marketData = new MarketData();
    await marketData
      .getTokenPrice(props.network.coingeckoID)
      .then(mdata => (tokenPrice = mdata || '0'));
  }

  const txActivity: Activity = {
    from: props.network.displayAddress(fromAddress),
    to: props.sparkAccount.defaultAddress,
    isIncoming: false,
    network: props.network.name,
    status: ActivityStatus.pending,
    timestamp: new Date().getTime(),
    token: {
      decimals: props.network.decimals,
      icon: props.network.icon,
      name: props.network.name_long,
      symbol: props.network.currencyName,
      price: tokenPrice,
    },
    type: ActivityType.transaction,
    value: amountToSendBN.minus(feeBn).toString(),
    transactionHash: '',
  };

  const activityState = new ActivityState();

  const api = (await props.network.api()) as unknown as FiroAPI;

  api
    .broadcastTx(rawTx)
    .then(({ txid }) => {
      trackSendEvents(SendEventType.SendComplete, {
        network: props.network.name,
      });
      activityState.addActivities(
        [
          {
            ...txActivity,
            ...{ transactionHash: txid },
          },
        ],
        {
          address: props.network.displayAddress(fromAddress),
          network: props.network.name,
        },
      );
      isTransferLoading.value = false;
    })
    .catch(error => {
      trackSendEvents(SendEventType.SendFailed, {
        network: props.network.name,
        error: error.message,
      });
      txActivity.status = ActivityStatus.failed;
      activityState.addActivities([txActivity], {
        address: fromAddress,
        network: props.network.name,
      });

      errorMsg.value = JSON.stringify(error);
      console.error('ERROR', error);
    });
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.anonymize-state {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  &__container {
    width: 800px;
    height: 600px;
    background: rgba(0, 0, 0, 0.32);
    margin: 0;
    box-sizing: border-box;
    position: absolute;
    z-index: 101;
    top: 0;
    &__popup {
      left: -195px;
    }
  }

  &__wrap {
    position: relative;
    background: @white;
    width: 320px;
    height: 100%;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
    border-radius: 12px;
    z-index: 102;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 36px 0 36px;
    gap: 10px;
  }

  &__checks {
    width: 100%;
    max-width: 150px;
    height: 60px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__item {
      display: flex;
      align-items: center;
      gap: 4px;

      &__checked,
      &__pending {
        width: 20px;
        height: 20px;
      }
    }
  }
}

.btn__anonymize-error {
  border: 1px solid @error !important;
  color: @error;
}

.btn__anonymize {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 14px;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid @darkBg;
  background: @buttonBg;
  transition: all 300ms ease-in-out;

  &__loading {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: @darkBg;
    border: 1px solid @orange01;
  }

  &:disabled {
    cursor: not-allowed;
    color: @black07;
    background: @gray01;
    border: 1px solid @gray01;
  }
}
</style>
