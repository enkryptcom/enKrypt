import { IndexedDBHelper } from '@action/db/indexedDB';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet';
import type { AnonymitySetMetaModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

export type StoredAnonymitySet = {
  coins: string[][];
  blockHash: string;
  setHash: string;
};

export type StoredCoin = {
  coin: string[];
  setId?: number;
  tag?: string;
};

export type CoinSetUpdateResult = {
  setId: number;
  blockHash: string;
  setHash: string;
  newCoins: string[][];
  containsMyCoins: boolean;
  matchedCoins: string[][];
};

export type CoinSetSyncOptions = {
  intervalMs?: number;
  onUpdate?: (results: CoinSetUpdateResult[]) => void;
  onMyCoinDetected?: (result: CoinSetUpdateResult) => void;
  onError?: (error: unknown) => void;
};

const wallet = new PublicFiroWallet();
const db = new IndexedDBHelper();

const getLocalSets = async (): Promise<StoredAnonymitySet[]> => {
  try {
    const data = await db.readData<StoredAnonymitySet[]>('data');
    if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('updateCoinSet:getLocalSets', 'Invalid data format', data);
      return [];
    }
  } catch (error) {
    console.warn(
      'updateCoinSet:getLocalSets',
      'Failed to read local sets',
      error,
    );
    return [];
  }
};

const getMyCoinHashes = async (): Promise<Set<string>> => {
  try {
    const myCoins = await db.readData<StoredCoin[]>('myCoins');
    if (!Array.isArray(myCoins)) {
      return new Set();
    }
    return new Set(
      myCoins
        .map(entry => entry?.coin?.[0])
        .filter(
          (hash): hash is string => typeof hash === 'string' && hash.length > 0,
        ),
    );
  } catch (error) {
    console.warn(
      'updateCoinSet:getMyCoinHashes',
      'Failed to read myCoins',
      error,
    );
    return new Set();
  }
};

const ensureLocalSetCapacity = (
  sets: StoredAnonymitySet[],
  index: number,
): StoredAnonymitySet[] => {
  if (sets.length <= index) {
    sets.length = index + 1;
  }
  return sets;
};

const fetchNewCoinsForSet = async (
  setId: number,
  meta: AnonymitySetMetaModel,
  localSet: StoredAnonymitySet | undefined,
): Promise<{ coins: string[][]; isFullReplacement: boolean }> => {
  const localCoinsCount = localSet?.coins?.length ?? 0;

  if (!localSet || meta.size <= localCoinsCount) {
    const fullSet = await wallet.fetchAnonymitySetSector(
      setId,
      meta.blockHash,
      0,
      meta.size,
    );
    return { coins: fullSet.coins ?? [], isFullReplacement: true };
  }

  const sector = await wallet.fetchAnonymitySetSector(
    setId,
    meta.blockHash,
    localCoinsCount,
    meta.size,
  );

  return { coins: sector.coins ?? [], isFullReplacement: false };
};

export const syncCoinSetsOnce = async (): Promise<CoinSetUpdateResult[]> => {
  const [remoteMetas, localSets, myCoinHashes] = await Promise.all([
    wallet.getAllSparkAnonymitySetMeta(),
    getLocalSets(),
    getMyCoinHashes(),
  ]);

  if (!remoteMetas?.length) {
    return [];
  }

  const updates: CoinSetUpdateResult[] = [];

  for (let index = 0; index < remoteMetas.length; index += 1) {
    const setId = index + 1;
    const meta = remoteMetas[index];
    const localSet = localSets[index];

    const hasLocalSet = Boolean(localSet);
    const localCoinCount = localSet?.coins?.length ?? 0;

    if (hasLocalSet) {
      const hashesMatch = meta.setHash === localSet!.setHash;
      const sizesMatch = meta.size === localCoinCount;

      if (hashesMatch && sizesMatch) {
        continue;
      }
    }

    const { coins: newCoins, isFullReplacement } = await fetchNewCoinsForSet(
      setId,
      meta,
      localSet,
    );

    if (!newCoins.length) {
      continue;
    }

    ensureLocalSetCapacity(localSets, index);

    if (!localSets[index] || isFullReplacement) {
      localSets[index] = {
        blockHash: meta.blockHash,
        setHash: meta.setHash,
        coins: [...newCoins],
      };

      await db.saveData('data', localSets);
    } else {
      localSets[index] = {
        blockHash: meta.blockHash,
        setHash: meta.setHash,
        coins: [...localSets[index].coins, ...newCoins],
      };

      await db.appendSetData('data', index, {
        coins: newCoins,
        blockHash: meta.blockHash,
        setHash: meta.setHash,
      });
    }

    const matchedCoins = newCoins.filter(coin =>
      myCoinHashes.has(coin?.[0] ?? ''),
    );

    updates.push({
      setId,
      blockHash: meta.blockHash,
      setHash: meta.setHash,
      newCoins,
      containsMyCoins: matchedCoins.length > 0,
      matchedCoins,
    });
  }

  return updates;
};

export const startCoinSetSync = (options?: CoinSetSyncOptions) => {
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
      const updates = await syncCoinSetsOnce();

      if (updates.length) {
        options?.onUpdate?.(updates);

        updates
          .filter(update => update.containsMyCoins)
          .forEach(update => options?.onMyCoinDetected?.(update));
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

  //   TODO:(N)(V) maybe we need add sync status providing mechanism for UI
};
