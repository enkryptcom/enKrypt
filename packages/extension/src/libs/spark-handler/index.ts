import * as bitcoin from 'bitcoinjs-lib';
import { isSparkAddress } from '@/providers/bitcoin/libs/utils';
import { createAsyncLock } from '@/libs/utils/async-mutex';
// Type-only: the build code itself runs in the spend worker.
import type {
  BuildSparkSpendMessage,
  BuildSparkSpendRequest,
  SendFromSparkAddressResult,
  SparkSpendProgress,
} from '@/libs/spark-handler/build-spark-spend';

export type {
  SendFromSparkAddressResult,
  SparkSpendProgress,
} from '@/libs/spark-handler/build-spark-spend';

export type SendFromSparkAddressOptions = {
  isMax?: boolean;
  onProgress?: (progress: SparkSpendProgress) => void;
  /** Aborting stops the worker and rejects with the abort reason. */
  signal?: AbortSignal;
};

export const sparkSendLock = createAsyncLock();

/** Builds a spend in a worker so the popup stays responsive; proofs can take
 * minutes when many coins are spent. */
export async function sendFromSparkAddress(
  networkInfo: bitcoin.Network,
  to: string,
  amount: string,
  { isMax = false, onProgress, signal }: SendFromSparkAddressOptions = {},
): Promise<SendFromSparkAddressResult> {
  signal?.throwIfAborted();
  const isSparkTransaction = await isSparkAddress(to);
  signal?.throwIfAborted();

  const worker = new Worker(
    new URL('../../ui/action/workers/sparkSpendWorker.ts', import.meta.url),
    { type: 'module' },
  );

  return new Promise<SendFromSparkAddressResult>((resolve, reject) => {
    const finish = () => {
      worker.terminate();
      signal?.removeEventListener('abort', onAbort);
    };
    const onAbort = () => {
      finish();
      reject(signal?.reason);
    };
    signal?.addEventListener('abort', onAbort);

    worker.onmessage = (event: MessageEvent<BuildSparkSpendMessage>) => {
      const message = event.data;
      if (message.type === 'progress') {
        onProgress?.(message.progress);
        return;
      }
      finish();
      if (message.type === 'result') {
        resolve(message.result);
      } else {
        reject(new Error(message.error));
      }
    };
    worker.onerror = event => {
      finish();
      reject(new Error(event.message || 'Spark spend worker failed.'));
    };

    const request: BuildSparkSpendRequest = {
      // Callers often pass a Vue reactive proxy, which cannot be cloned.
      networkInfo: JSON.parse(JSON.stringify(networkInfo)),
      to,
      amount,
      isMax,
      isSparkTransaction,
    };
    worker.postMessage(request);
  });
}
