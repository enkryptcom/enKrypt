import { DbKeys, IndexedDBHelper } from '@action/db/indexedDB.ts';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet.ts';

type SetsUpdateResult = {
  tags: string[];
};

export type TagsSyncOptions = {
  intervalMs?: number;
  onUpdate?: (results: SetsUpdateResult) => void;
  onError?: (error: unknown) => void;
};

const wallet = new PublicFiroWallet();
const db = new IndexedDBHelper();

const syncTagsOnce = async (): Promise<SetsUpdateResult> => {
  const localTagsLength = await db.getLengthOf(DbKeys.usedCoinsTags);

  return await wallet.getUsedSparkCoinsTags(localTagsLength - 1);
};

export const startCoinSetSync = (options?: TagsSyncOptions) => {
  const intervalMs = options?.intervalMs ?? 60_000;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let isRunning = false;

  const scheduleNext = () => {
    if (stopped) return;
    timer = setTimeout(run, intervalMs);
  };

  const run = async () => {
    if (isRunning) {
      scheduleNext();
      return;
    }

    isRunning = true;
    try {
      const updates = await syncTagsOnce();

      if (updates.length) {
        options?.onUpdate?.(updates);
      }
    } catch (error) {
      options?.onError?.(error);
    } finally {
      isRunning = false;
      scheduleNext();
    }
  };

  run();

  return () => {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
};
