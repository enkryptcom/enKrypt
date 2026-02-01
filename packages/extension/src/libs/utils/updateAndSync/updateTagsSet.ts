import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet';
import { differenceSets } from '@action/utils/set-utils';

type SetsUpdateResult = {
  tags: string[];
  // txHashes: string[];
};

export type TagsSyncOptions = {
  intervalMs?: number;
  onUpdate?: (results: SetsUpdateResult) => void;
  onError?: (error: unknown) => void;
  onComplete?: () => void;
};

const wallet = new PublicFiroWallet();
const db = new IndexedDBHelper();

const syncTagsOnce = async (): Promise<SetsUpdateResult> => {
  try {
    const localTags = await db.readData<{ tags: string[] }>(
      DB_DATA_KEYS.usedCoinsTags,
    );

    const txHashes = await wallet.getUsedCoinsTagsTxHashes(0);
    const updates = await wallet.getUsedSparkCoinsTags(
      !!localTags?.tags?.length ? localTags?.tags?.length : 0,
    );

    const diffTags = differenceSets(
      new Set(localTags?.tags ?? []),
      new Set(updates?.tags ?? []),
    );

    const mergedTags = Array.from(
      new Set([...(diffTags.values() ?? []), ...(updates?.tags ?? [])]),
    );
    await db.saveData(DB_DATA_KEYS.usedCoinsTags, {
      tags: mergedTags,
      txHashes: txHashes.tagsandtxids,
    });

    // Prevent sending updates if there are no new tags
    if (mergedTags.length === localTags?.tags?.length) {
      return { tags: [] };
    }

    return updates;
  } catch (error) {
    throw error;
  }
};

export const startTagSetSync = (options?: TagsSyncOptions) => {
  const intervalMs = options?.intervalMs ?? 60_000;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let isRunning = false;
  let hasCompletedOnce = false;

  const fireCompleteOnce = () => {
    if (!hasCompletedOnce) {
      hasCompletedOnce = true;
      options?.onComplete?.();
    }
  };

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

      if (updates?.tags?.length) {
        options?.onUpdate?.(updates);
      } else {
      }

      fireCompleteOnce();
    } catch (error) {
      options?.onError?.(error);

      fireCompleteOnce();
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
