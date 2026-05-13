import { ref, watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types';
import { startCoinSetSync } from '@/libs/utils/updateAndSync/updateCoinSet';
import { appendCoinSetUpdates } from '@/libs/utils/updateAndSync/handleCoinSetUpdates';
import { BaseNetwork } from '@/types/base-network';
import {
  markCoinsAsUsed,
  SparkUnusedTxDetails,
} from '@/libs/utils/updateAndSync/markCoinsAsUsed';

let worker: Worker | null = null;

export const useSynchronizeSparkState = (
  networkRef: Ref<BaseNetwork>,
  onBalanceCalculated?: () => void,
) => {
  const isCoinFetchPending = ref(false);
  const isTagFetchPending = ref(false);
  const error = ref(null);

  const isWorkerRunning = ref(false);
  const pendingWorkerRun = ref(false);

  const coinSyncFinished = ref(false);
  const tagSyncFinished = ref(false);
  const workerFinished = ref(false);

  const sparkUnusedTxDetails = ref<SparkUnusedTxDetails[]>([]);

  const cleanupAndMaybeRestart = () => {
    worker?.terminate();
    worker = null;

    isWorkerRunning.value = false;

    if (pendingWorkerRun.value) {
      pendingWorkerRun.value = false;
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

    isWorkerRunning.value = true;
    pendingWorkerRun.value = false;

    worker.onmessage = () => {
      workerFinished.value = true;
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
          isCoinFetchPending.value = true;
          isTagFetchPending.value = true;
          await appendCoinSetUpdates(updates);
          synchronizeWorker();
          coinSyncFinished.value = true;
          tagSyncFinished.value = true;
        },
        onComplete: () => {
          synchronizeWorker();
          coinSyncFinished.value = true;
          tagSyncFinished.value = true;
        },
      });

      return { stopCoinSetSyncFn };
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
        const { stopCoinSetSyncFn } = stopFns;

        onCleanup(() => {
          stopCoinSetSyncFn();
          isCoinFetchPending.value = false;
          isTagFetchPending.value = false;
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => [
      coinSyncFinished.value,
      tagSyncFinished.value,
      workerFinished.value,
      pendingWorkerRun.value,
    ],
    async ([coinDone, tagDone, workerDone, pendingWorker]) => {
      if (coinDone && workerDone) {
        isCoinFetchPending.value = false;
        coinSyncFinished.value = false;
      }
      if (tagDone) {
        isTagFetchPending.value = false;
        tagSyncFinished.value = false;
      }

      console.log({ coinDone, tagDone, workerDone });
      if (workerDone && !pendingWorker) {
        workerFinished.value = false;
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
