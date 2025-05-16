<template>
  <div class="network-activity-total">
    <div v-if="cryptoAmount == '~'" class="network-activity-total__total">
      <balance-loader class="network-activity-total__loader-one" />
      <balance-loader class="network-activity-total__loader-two" />
    </div>
    <div v-else class="network-activity-total__total">
      <h3>
        {{ cryptoAmount }} <span>{{ symbol }}</span>
      </h3>
      <p>
        <span v-if="subnetwork !== ''">Chain {{ subnetwork }} &middot;</span>
        {{ fiatAmount }}
      </p>
    </div>
    <button
      :disabled="isAnonymizeBtnDisabled"
      v-if="network.name === NetworkNames.Firo && sparkAccount"
      class="network-activity-total__anonymize"
      :class="{ 'network-activity-total__anonymize-error': !!errorMsg }"
      @click="anonymizeFunds()"
    >
      Anonymize funds
    </button>
    <button
      :disabled="isSynchronizeBtnDisabled"
      v-if="network.name === NetworkNames.Firo && sparkAccount"
      class="network-activity-total__sync"
      :class="{ 'network-activity-total__anonymize-error': !!syncErrorMsg }"
      @click="synchronize()"
    >
      Sync
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
import FiroAPI from '@/providers/bitcoin/libs/api-firo';
import { validator } from '@/providers/bitcoin/libs/firo-wallet/firo-wallet';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import BalanceLoader from '@action/icons/common/balance-loader.vue';
import { AccountsHeaderData, SparkAccount } from '@action/types/account.ts';
import { NetworkNames } from '@enkryptcom/types/dist';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { computed, PropType, ref } from 'vue';
import { wasmInstance } from '@/libs/utils/wasm-loader.ts';
import {
  getIncomingViewKey,
  getSpendKeyObj,
} from '@/libs/spark-handler/generateSparkWallet.ts';
import { IndexedDBHelper } from '@action/db/indexedDB.ts';

const emits = defineEmits<{
  (e: 'update:spark-state', network: BitcoinNetwork): void;
}>();

const props = defineProps({
  isSyncing: {
    type: Boolean,
    default: false,
  },
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

const wallet = new PublicFiroWallet();
const db = new IndexedDBHelper();

const isTransferLoading = ref(false);
const errorMsg = ref();
const syncErrorMsg = ref();
const isSyncBtnDisabled = ref(false);

const isAnonymizeBtnDisabled = computed(() => {
  return isTransferLoading.value || Number(props.cryptoAmount) <= 0;
});

const isSynchronizeBtnDisabled = computed(() => {
  return isSyncBtnDisabled.value || props.isSyncing;
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

  console.log(inputAmountBn.toString());

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

const synchronize = async () => {
  try {
    isSyncBtnDisabled.value = true;
    syncErrorMsg.value = undefined;

    const wasm = await wasmInstance.getInstance();
    const spendKeyObj = await getSpendKeyObj(wasm);

    const setsMeta = await wallet.getAllSparkAnonymitySetMeta();
    const isDBEmpty = !(await db.readData()).length;

    if (!isDBEmpty) {
      const dbSetsMeta = await Promise.all(
        setsMeta.map(async (setMeta, index) => {
          return db.getLengthOf(index);
        }),
      );

      const diff = setsMeta
        .map((setMeta, index) => {
          return dbSetsMeta[index] === setMeta.size
            ? null
            : {
                setId: index + 1,
                latestBlockHash: setMeta.blockHash,
                startIndex: dbSetsMeta[index],
                endIndex: setMeta.size,
              };
        })
        .filter(Boolean) as {
        setId: number;
        latestBlockHash: string;
        startIndex: number;
        endIndex: number;
      }[];

      console.log('Loading sets');
      console.log('diff ->>', diff);

      await Promise.all(
        diff.map(async difference => {
          const { setId, latestBlockHash, startIndex, endIndex } = difference;
          const set = await wallet.fetchAnonymitySetSector(
            setId,
            latestBlockHash,
            startIndex,
            endIndex,
          );
          console.log('set ->>', set);
          await db.appendData(set.coins, difference.setId - 1);
        }),
      );
    } else {
      console.warn('Loading all sets...');
      const allSets = await wallet.fetchAllAnonymitySets();
      await db.saveData(allSets);
    }

    if (!spendKeyObj || spendKeyObj === 0) {
      throw new Error('Failed to create spendKeyObj');
    }

    const incomingViewKey = await getIncomingViewKey(wasm, spendKeyObj);

    if (!incomingViewKey) {
      throw new Error('Failed to create IncomingViewKey');
    }

    const { incomingViewKeyObj, fullViewKeyObj } = incomingViewKey;

    if (
      !incomingViewKeyObj ||
      incomingViewKeyObj === 0 ||
      fullViewKeyObj === 0
    ) {
      throw new Error('Failed to create IncomingViewKey and fullViewKeyObj');
    }
    isSyncBtnDisabled.value = false;
  } catch (error) {
    console.log(error);
    syncErrorMsg.value = JSON.stringify(error);
  }

  // try {

  // const setWithFirstCoin = [{
  //     "blockHash": "afcoNhx8OZpqIjDagV+PXMswpOkWBKyhMFOp5isvQgk=",
  //     "setHash": "JRQ4f0nEB3I3dGBQVYQj8rptzvM8Ulci0nAJY8rSsVw=",
  //     "coins": [[
  //       "ACwgrzHnKO1uQze+RTsZjDFI6EJ5KmpA0lvgI+uMw/Z6AQCgGjLAp89G2/Zm+bMe7zL/sOgAaZbu254GF8h5e8Ze4QAAACAuyRMVLxgMd0cBXVHj5WMPDUAnBe3ZRG+/vuHV8kABAFIIK5I4lKqWUos+pw/C5nMdYZr0NmOQrQnx7zOOWvgEbOYZ1vhEO8r4RcnKkmMFDHF0rxkMbQDWwKwdli0IQaF/fQzZITUAr0WTiVjzI7DcXp6gEFmc7jF2I3ZIwxC7A5skxG8gF0dhMAgjoPM42l+AVPEdQN1Tu6kj0HpFYrTf0myudDU+XaASAAAAAP3eecYxAYG0Mr2zlIVQG/319YnoPkx3P7ZHm9fWgOaTKbpcHsB/OHsVngarYfP3nZO+q7ck87jVDVGmTNuZ5eQ7AQAAAAD+////",
  //       "/d55xjEBgbQyvbOUhVAb/fX1ieg+THc/tkeb19aA5pM=",
  //       "ulwewH84exWeBqth8/edk76rtyTzuNUNUaZM25nl5DsBAAAAAP7///8="
  //     ]]
  //   }]
  //
  //
  // console.log({setWithFirstCoin})

  // allSets.forEach(set => {
  //   chunkedEvery(
  //     set.coins,
  //     50,
  //     coin => {
  //       getSparkCoinInfo({
  //         coin: coin,
  //         fullViewKeyObj,
  //         incomingViewKeyObj,
  //         wasmModule: wasm,
  //       });
  //       //   .then(result => {
  //       //   if (typeof result === 'string') {
  //       //     coinFetchDataResult.value[result]
  //       //       ? (coinFetchDataResult.value[result] =
  //       //           coinFetchDataResult.value[result] + 1)
  //       //       : (coinFetchDataResult.value[result] = 1);
  //       //   } else {
  //       //     console.log(result);
  //       //   }
  //       // });
  //     },
  //     () => {
  //       console.log(coinFetchDataResult);
  //     },
  //   );

  // set.coins.forEach((coin, i) => {
  //   if (i  % 1000 === 0) {
  //     console.log(i);
  //   }
  //   getSparkCoinInfo({
  //     coin: coin,
  //     fullViewKeyObj,
  //     incomingViewKeyObj,
  //     wasmModule: wasm,
  //   }).then(result => {
  //     if (typeof result === 'string') {
  //       coinFetchDataResult[result] !== undefined
  //         ? (coinFetchDataResult[result] = coinFetchDataResult[result] + 1)
  //         : (coinFetchDataResult[result] = 0);
  //     } else {
  //       console.log(result);
  //     }
  //   });
  //
  //   // console.log('Coin:', coin);
  // });
  // });

  // slicedSet.coins.forEach((coin, i) => {
  //   if (i  % 1000 === 0) {
  //     console.log(i);
  //   }
  //     getSparkCoinInfo({
  //       coin: coin,
  //       fullViewKeyObj,
  //       incomingViewKeyObj,
  //       wasmModule: wasm,
  //     }).then(result => {
  //       if (typeof result === 'string') {
  //         coinFetchDataResult[result] !== undefined
  //           ? (coinFetchDataResult[result] = coinFetchDataResult[result] + 1)
  //           : (coinFetchDataResult[result] = 0);
  //       } else {
  //         console.log(result);
  //       }
  //     });
  //
  //     // console.log('Coin:', coin);
  // });

  // postMessage('Done');
  // } catch (error) {
  //   console.log(error);
  //   // postMessage('error');
  // }
  // TODO: add later
  // finally {
  //   wasm.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
  // }

  // worker.postMessage(
  //   {
  //     allSets,
  //     incomingViewKeyObj,
  //     fullViewKeyObj,
  //   }
  // );
  //
  // worker.onmessage = ({ data }) => {
  //   console.log(data, 'Data from worker');
  // };

  // allSets.forEach(set => {
  //   set.coins.forEach(coin => {
  //     getSparkCoinInfo({
  //       coin,
  //       selectedAccount: accountHeaderData!.value!.selectedAccount!,
  //     });
  //   });
  // });
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.network-activity-total {
  display: flex;
  align-items: flex-start;

  &__sync {
    padding: 8px 16px;
    margin-left: 8px;
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

  &__anonymize-error {
    border: 1px solid @error !important;
    color: @error;
  }

  &__anonymize {
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
