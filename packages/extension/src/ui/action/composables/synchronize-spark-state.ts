import { ref, watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { startCoinSetSync } from '@/libs/utils/updateAndSync/updateCoinSet';
import { appendCoinSetUpdates } from '@/libs/utils/updateAndSync/handleCoinSetUpdates';
import { startTagSetSync } from '@/libs/utils/updateAndSync/updateTagsSet';
import { BaseNetwork } from '@/types/base-network';
import { IndexedDBHelper } from '@action/db/indexedDB';
import { FullTransactionModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { markCoinsAsUsed } from '@/libs/utils/updateAndSync/marCoinAsUsed';

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
        const { stopSyncTagSetFn, stopCoinSetSyncFn } = stopFns;

        onCleanup(() => {
          console.log(
            '%c[Network Change] Stopping previous sync processes',
            'color: orange',
          );
          stopCoinSetSyncFn();
          stopSyncTagSetFn();
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => [coinFetchDone.value, tagFetchDone.value],
    async ([updatedCoinFetchDone, updatedTagFetchDone]) => {
      if (updatedCoinFetchDone && updatedTagFetchDone) {
        coinFetchDone.value = false;
        tagFetchDone.value = false;
        sparkUnusedTxDetails.value = await markCoinsAsUsed(onBalanceCalculated);
      }
    },
  );

  return {
    synchronize,
    isPending,
    error,
    sparkUnusedTxDetails,
  };
};
