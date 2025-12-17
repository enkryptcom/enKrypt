<template>
  <div class="network-activity-total-wrapper">
    <div
      v-if="cryptoAmount == '~' && !assumedError"
      class="network-activity__total"
    >
      <balance-loader class="network-activity__loader-one" />
      <balance-loader class="network-activity__loader-two" />
    </div>
    <div v-else-if="assumedError" class="network-activity__total-error">
      <h3>
        <span>Loading balance error. Please try again later</span>
      </h3>
    </div>
    <div v-else class="network-activity__total">
      <h3>
        {{ cryptoAmount }} <span>{{ symbol }}</span>
      </h3>
      <p>
        <span v-if="subnetwork !== ''">Chain {{ subnetwork }} &middot;</span>
        {{ $filters.parseCurrency(fiatAmount) }}
      </p>
    </div>
    <button
      :disabled="isAnonymizeBtnDisabled"
      v-if="network.name === NetworkNames.Firo && sparkAccount"
      class="btn__anonymize"
      :class="{ 'btn__anonymize-error': !!errorMsg }"
      @click="anonymizeFunds()"
    >
      Anonymize funds
    </button>
  </div>
</template>

<script setup lang="ts">
import ActivityState from '@/libs/activity-state';
import MarketData from '@/libs/market-data';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import { createTempTx } from '@/libs/spark-handler/createTempTx';
import { getFee } from '@/libs/spark-handler/getFee';
import { getMintTxData } from '@/libs/spark-handler/getMintTxData';
import { getTotalMintedAmount } from '@/libs/spark-handler/getTotalMintedAmount';
import { wasmInstance } from '@/libs/utils/wasm-loader';
import FiroAPI from '@/providers/bitcoin/libs/api-firo';
import { validator } from '@/providers/bitcoin/libs/firo-wallet/firo-wallet';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import BalanceLoader from '@action/icons/common/balance-loader.vue';
import { onBeforeMount, ref, PropType, watchEffect, computed } from 'vue';
import { AccountsHeaderData, SparkAccount } from '@action/types/account';
import { NetworkNames } from '@enkryptcom/types';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';

const props = defineProps({
  cryptoAmount: {
    type: String,
    default: '0',
  },
  fiatAmount: {
    type: String,
    default: '0',
  },
  symbol: {
    type: String,
    default: '',
  },
  subnetwork: {
    type: String,
    default: '',
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
});

let timer: NodeJS.Timeout | null = null;
const assumedError = ref(false);

watchEffect(() => {
  if (timer) {
    clearTimeout(timer);
  }
  // set the timer on initial change to blank
  if (props.cryptoAmount == '~') {
    timer = setTimeout(() => {
      assumedError.value = true;
    }, 30000);
  }
});

onBeforeMount(() => {
  if (timer) {
    clearTimeout(timer);
  }
});

const wallet = new PublicFiroWallet();

const isTransferLoading = ref(false);
const errorMsg = ref();

const isAnonymizeBtnDisabled = computed(() => {
  return isTransferLoading.value || Number(props.cryptoAmount) <= 0;
});

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

<style lang="less">
@import '@action/styles/theme.less';

.network-activity-total-wrapper {
  display: flex;
  align-items: flex-start;
}

.btn__anonymize-error {
  border: 1px solid @error !important;
  color: @error;
}

.btn__anonymize {
  padding: 8px 16px;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid @darkBg;
  margin-top: 4px;
  background: @buttonBg;
  transition: all 300ms ease-in-out;

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

.network-activity {
  &__total-error {
    padding: 0 20px 12px 20px;

    h3 {
      span {
        color: @error;
      }
    }
  }
  &__total {
    padding: 0 20px 12px 20px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;

      span {
        font-variant: small-caps;
      }
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @secondaryLabel;
      margin: 0;
    }
  }

  &__loader-one {
    width: 100px;
    height: 18px;
    margin-bottom: 13px;
    margin-top: 6px;
    display: block !important;
  }

  &__loader-two {
    width: 70px;
    height: 13px;
    display: block !important;
    margin-bottom: 6px;
  }
}
</style>
