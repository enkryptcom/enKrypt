import { ref, watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { startCoinSetSync } from '@/libs/utils/updateAndSync/updateCoinSet';
import { appendCoinSetUpdates } from '@/libs/utils/updateAndSync/handleCoinSetUpdates';
import { startTagSetSync } from '@/libs/utils/updateAndSync/updateTagsSet';
import { BaseNetwork } from '@/types/base-network';
import {
  markCoinsAsUsed,
  SparkUnusedTxDetails,
} from '@/libs/utils/updateAndSync/markCoinsAsUsed';

let worker: Worker | null = null;

export const useSynchronizeSparkState = (
  networkRef: Ref<BaseNetwork>,
  onBalanceCalculated?: (balance: string) => void,
) => {
  const isCoinFetchPending = ref(false);
  const isTagFetchPending = ref(false);
  const error = ref(null);

  const isWorkerRunning = ref(false);
  const pendingWorkerRun = ref(false);

  const coinFetchDone = ref(false);
  const tagFetchDone = ref(false);

  const sparkUnusedTxDetails = ref<SparkUnusedTxDetails[]>([]);

  const cleanupAndMaybeRestart = () => {
    worker?.terminate();
    worker = null;

    isWorkerRunning.value = false;

    if (pendingWorkerRun.value) {
      console.log('[synchronizeWorker] restarting postponed run');
      synchronizeWorker();
    }
  };

  const synchronizeWorker = () => {
    if (isWorkerRunning.value) {
      pendingWorkerRun.value = true;
      console.log('Worker already running, skip start');
      return;
    }

    worker = new Worker(
      new URL('../workers/sparkCoinInfoWorker.ts', import.meta.url),
      { type: 'module' },
    );

    console.log('%c[synchronizeWorker] Worker initialized', 'color: green');

    isWorkerRunning.value = true;
    pendingWorkerRun.value = false;

    worker.onmessage = () => {
      coinFetchDone.value = true;
      cleanupAndMaybeRestart();
    };

    worker.onerror = () => {
      cleanupAndMaybeRestart();
    };

    worker.postMessage('');
  };

  const synchronize = async () => {
    try {
      const networkName = networkRef.value.name;
      if (networkName !== NetworkNames.Firo) return;

      isCoinFetchPending.value = true;
      isTagFetchPending.value = true;

      const stopCoinSetSyncFn = startCoinSetSync({
        onUpdate: async updates => {
          console.log(
            '%c[synchronize] Coin set updates received',
            'color: blue',
            updates,
          );
          await appendCoinSetUpdates(updates);
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
          isCoinFetchPending.value = false;
          isTagFetchPending.value = false;
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => [coinFetchDone.value, tagFetchDone.value],
    async ([updatedCoinFetchDone, updatedTagFetchDone]) => {
      if (updatedCoinFetchDone) {
        isCoinFetchPending.value = false;
      }
      if (updatedTagFetchDone) {
        isTagFetchPending.value = false;
      }

      if (updatedCoinFetchDone && updatedTagFetchDone) {
        coinFetchDone.value = false;
        tagFetchDone.value = false;
        sparkUnusedTxDetails.value = await markCoinsAsUsed(onBalanceCalculated);
      }
    },
  );

  return {
    synchronize,
    isCoinFetchPending,
    isTagFetchPending,
    error,
    sparkUnusedTxDetails,
  };
};
