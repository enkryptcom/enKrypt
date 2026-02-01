import { ref, onMounted, watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { startCoinSetSync } from '@/libs/utils/updateAndSync/updateCoinSet';
import { appendCoinSetUpdates } from '@/libs/utils/updateAndSync/handleCoinSetUpdates';
import { startTagSetSync } from '@/libs/utils/updateAndSync/updateTagsSet';
import BigNumber from 'bignumber.js';
import { BaseNetwork } from '@/types/base-network';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { intersectSets } from '@action/utils/set-utils';
import {
  FullTransactionModel,
  MyCoinModel,
} from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { base64ToReversedHex } from '@/libs/spark-handler/utils';
import { firoElectrum } from '@/providers/bitcoin/libs/electrum-client/electrum-client';

export const useSynchronizeSparkState = (
  networkRef: Ref<BaseNetwork>,
  onBalanceCalculated?: (balance: string) => void,
) => {
  const db = new IndexedDBHelper();

  const isPending = ref(false);
  const error = ref(null);

  const coinFetchDone = ref(false);
  const tagFetchDone = ref(false);

  const sparkUnusedTxDetails = ref<FullTransactionModel[]>([]);

  const markCoinsAsUsed = async () => {
    const usedCoinsTags = await db.readData<{
      tags: string[];
      txHashes: [string, string][];
    }>(DB_DATA_KEYS.usedCoinsTags);

    const coinsTagsSet = new Set(usedCoinsTags?.tags ?? []);
    const myCoins = await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins);
    const myCoinsTagsSet = new Set((myCoins ?? []).map(coin => coin.tag));

    coinFetchDone.value = false;
    tagFetchDone.value = false;

    if (!myCoins?.length || !usedCoinsTags?.tags?.length) {
      return;
    }

    const usedMyCoinsTagsSet = intersectSets(coinsTagsSet, myCoinsTagsSet);

    await db.markCoinsAsUsed(Array.from(usedMyCoinsTagsSet));

    const myCoinsIsUsedApplied = await db.readData<MyCoinModel[]>(
      DB_DATA_KEYS.myCoins,
    );

    const unusedCoins = myCoinsIsUsedApplied.filter(el => !el.isUsed);

    const balance = unusedCoins.reduce((a: bigint, c) => a + c.value, 0n);

    const mintIds = unusedCoins.map(unusedCoin => unusedCoin.coin[1]);

    const txIdsDecoded = mintIds
      .map(base64 => {
        try {
          return base64ToReversedHex(base64);
        } catch {
          return '';
        }
      })
      .filter(Boolean);

    console.log('===>>>Unused Spark Coins TX IDs:', txIdsDecoded);

    if (!!txIdsDecoded?.length) {
      const results =
        await firoElectrum.multiGetTransactionByTxid(txIdsDecoded);

      sparkUnusedTxDetails.value = Object.values(results);
    } else {
      sparkUnusedTxDetails.value = [];
    }

    console.log('===>>>Spark Unused TX Details:', sparkUnusedTxDetails.value);

    const sparkBalance = new BigNumber(balance.toString()).toString();

    if (onBalanceCalculated) {
      try {
        onBalanceCalculated(sparkBalance);
      } catch (err) {
        console.error('Error in onBalanceCalculated callback:', err);
      }
    }
    await db.saveData('sparkBalance', sparkBalance);
  };

  const synchronizeWorker = () => {
    const worker = new Worker(
      new URL('../workers/sparkCoinInfoWorker.ts', import.meta.url),
      { type: 'module' },
    );

    console.log('%c[synchronizeWorker] Worker initialized', 'color: green');

    worker.postMessage('');

    worker.onmessage = () => {
      coinFetchDone.value = true;
    };
  };

  const synchronize = async () => {
    try {
      const networkName = networkRef.value.name;
      if (networkName !== NetworkNames.Firo) return;

      isPending.value = true;

      const stopCoinSetSyncFn = startCoinSetSync({
        onUpdate: updates => {
          console.log(
            '%c[synchronize] Coin set updates received',
            'color: blue',
            updates,
          );
          void appendCoinSetUpdates(updates);
          synchronizeWorker();
        },
        onComplete: () => {
          synchronizeWorker();
        },
      });

      const stopSyncTagSetFn = startTagSetSync({
        onComplete: () => {
          tagFetchDone.value = true;
        },
      });

      return { stopCoinSetSyncFn, stopSyncTagSetFn };
    } catch (err: any) {
      error.value = err;
      console.error('Syncing error:', err);
    } finally {
      isPending.value = false;
    }
  };

  watch(
    () => networkRef.value.name,
    async (_v, _ov, onCleanup) => {
      const stopFns = await synchronize();

      if (stopFns) {
        const { stopSyncTagSetFn, stopCoinSetSyncFn } = stopFns

        onCleanup(() => {
          console.log("%c[Network Change] Stopping previous sync processes", 'color: orange');
          stopCoinSetSyncFn();
          stopSyncTagSetFn();
        });
      }
    },
    { immediate: true }
  );

  watch(
    () => [coinFetchDone.value, tagFetchDone.value],
    ([updatedCoinFetchDone, updatedTagFetchDone]) => {
      if (updatedCoinFetchDone && updatedTagFetchDone) {
        void markCoinsAsUsed();
      }
    },
  );

  onMounted(() => {
    void synchronize();
  });

  return {
    synchronize,
    isPending,
    error,
    sparkUnusedTxDetails,
  };
};
