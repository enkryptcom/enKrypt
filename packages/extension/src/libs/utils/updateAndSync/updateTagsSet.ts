import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB.ts';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet.ts';
import { differenceSets } from '@action/utils/set-utils.ts';

type SetsUpdateResult = {
  tags: string[];
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
  console.log('%c[updateTagsSet] syncTagsOnce: start', 'color: yellow');
  try {
    const localTags = await db.readData<{ tags: string[] }>(
      DB_DATA_KEYS.usedCoinsTags,
    );
    console.log(
      '%c[updateTagsSet] syncTagsOnce: localTagsLength =',
      'color: yellow',
      localTags?.tags?.length,
    );

    const updates = await wallet.getUsedSparkCoinsTags(
      !!localTags?.tags?.length ? localTags?.tags?.length : 0,
    );

    const diffTags = differenceSets(
      new Set(updates?.tags ?? []),
      new Set(localTags?.tags ?? []),
    );

    const mergedTags = Array.from(
      new Set([...(diffTags.values() ?? []), ...(updates?.tags ?? [])]),
    );
    await db.saveData(DB_DATA_KEYS.usedCoinsTags, { tags: mergedTags });
    console.log(
      '%c[updateTagsSet] syncTagsOnce: received tags count =',
      'color: yellow',
      updates?.tags,
    );

    // Prevent sending updates if there are no new tags
    if (mergedTags.length === localTags?.tags?.length) {
      return { tags: [] };
    }

    return updates;
  } catch (error) {
    console.log(
      '%c[updateTagsSet] syncTagsOnce: error',
      'color: yellow',
      error,
    );
    throw error;
  }
};

export const startTagSetSync = (options?: TagsSyncOptions) => {
  console.log(
    '%c[updateTagsSet] startCoinSetSync: starting with intervalMs =',
    'color: yellow',
    options?.intervalMs ?? 60_000,
  );
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
    console.log(
      '%c[updateTagsSet] startCoinSetSync: scheduling next run in',
      'color: yellow',
      intervalMs,
      'ms',
    );
    timer = setTimeout(run, intervalMs);
  };

  const run = async () => {
    if (isRunning) {
      console.log(
        '%c[updateTagsSet] startCoinSetSync: run already in progress, scheduling next',
        'color: yellow',
      );
      scheduleNext();
      return;
    }

    isRunning = true;
    console.log(
      '%c[updateTagsSet] startCoinSetSync: run started',
      'color: yellow',
    );
    try {
      const updates = await syncTagsOnce();
      console.log(
        '%c[updateTagsSet] startCoinSetSync: updates received, tags length =',
        'color: yellow',
        updates?.tags?.length ?? 0,
      );

      if (updates?.tags?.length) {
        console.log(
          '%c[updateTagsSet] startCoinSetSync: calling onUpdate callback',
          'color: yellow',
        );
        options?.onUpdate?.(updates);
      } else {
        console.log(
          '%c[updateTagsSet] startCoinSetSync: no tags to update',
          'color: yellow',
        );
      }

      fireCompleteOnce();
    } catch (error) {
      console.log(
        '%c[updateTagsSet] startCoinSetSync: error during run',
        'color: yellow',
        error,
      );
      options?.onError?.(error);

      fireCompleteOnce();
    } finally {
      isRunning = false;
      console.log(
        '%c[updateTagsSet] startCoinSetSync: run completed',
        'color: yellow',
      );
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
    console.log('%c[updateTagsSet] startCoinSetSync: stopped', 'color: yellow');
  };
};
