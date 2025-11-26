import { ref, onMounted, watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { startCoinSetSync } from '@/libs/utils/updateAndSync/updateCoinSet';
import { startTagSetSync } from '@/libs/utils/updateAndSync/updateTagsSet';
import BigNumber from 'bignumber.js';
import { BaseNetwork } from '@/types/base-network';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { intersectSets } from '@action/utils/set-utils';
import { MyCoinModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum.ts';

export const useSynchronizeSparkState = (
  networkRef: Ref<BaseNetwork>,
  onBalanceCalculated?: (balance: string) => void,
) => {
  const db = new IndexedDBHelper();

  const isPending = ref(false);
  const error = ref(null);

  const coinFetchDone = ref(false);
  const tagFetchDone = ref(false);

  const markCoinsAsUsed = async () => {
    console.log(
      '%c markCoinsAsUsed: start',
      'color: #00FFFF; font-weight: bold; font-size: 24px;',
    );
    const usedCoinsTags = await db.readData<{ tags: string[] }>(
      DB_DATA_KEYS.usedCoinsTags,
    );

    const coinsTagsSet = new Set(usedCoinsTags?.tags ?? []);
    const myCoins = await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins);
    const myCoinsTagsSet = new Set((myCoins ?? []).map(coin => coin.tag));

    const usedMyCoinsTagsSet = intersectSets(coinsTagsSet, myCoinsTagsSet);

    await Promise.all(
      Array.from(usedMyCoinsTagsSet).map(tag => db.markCoinsAsUsed(tag)),
    );

    coinFetchDone.value = false;
    tagFetchDone.value = false;

    const myCoinsIsUsedApplied = await db.readData<MyCoinModel[]>(
      DB_DATA_KEYS.myCoins,
    );

    const balance = myCoinsIsUsedApplied
      .filter(el => !el.isUsed)
      .reduce((a: bigint, c) => a + c.value, 0n);

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

    worker.onmessage = ({ data }) => {
      console.log(
        '%c[synchronizeWorker] Worker onmessage data:',
        'color: green',
        data,
      );

      coinFetchDone.value = true;
    };
  };

  const synchronize = async () => {
    try {
      const networkName = networkRef.value.name;
      if (networkName !== NetworkNames.Firo) return;

      isPending.value = true;

      startCoinSetSync({
        onComplete: () => {
          console.log('%cCoin set sync completed', 'color: red', networkName);
          synchronizeWorker();
        },
      });

      startTagSetSync({
        onComplete: () => {
          console.log('%cTag set sync completed', 'color: red');
          tagFetchDone.value = true;
        },
      });
    } catch (err: any) {
      error.value = err;
      console.error('Syncing error:', err);
    } finally {
      isPending.value = false;
    }
  };

  watch(() => networkRef.value.name, synchronize, { immediate: true });

  watch(
    () => [coinFetchDone.value, tagFetchDone.value],
    ([updatedCoinFetchDone, updatedTagFetchDone]) => {
      console.log(
        '%c watch: coinFetchDone or tagFetchDone updated',
        'color: #00FF00; font-weight: bold; font-size: 24px;',
        updatedCoinFetchDone,
        updatedTagFetchDone,
      );
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
  };
};
