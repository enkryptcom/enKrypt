import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet';
import type { AnonymitySetMetaModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { differenceSets } from '@action/utils/set-utils.ts';

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
  onComplete?: () => void;
};

const wallet = new PublicFiroWallet();
const db = new IndexedDBHelper();

const getLocalSets = async (): Promise<StoredAnonymitySet[]> => {
  try {
    const data =
      (await db.readData<StoredAnonymitySet[]>(DB_DATA_KEYS.sets)) ?? [];
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
    const hashes = new Set(
      myCoins
        .map(entry => entry?.coin?.[0])
        .filter(
          (hash): hash is string => typeof hash === 'string' && hash.length > 0,
        ),
    );
    return hashes;
  } catch (error) {
    console.warn(
      'updateCoinSet:getMyCoinHashes',
      'Failed to read myCoins',
      error,
    );
    return new Set();
  }
};

const fetchNewCoinsForSet = async (
  setId: number,
  meta: AnonymitySetMetaModel,
  localSet: StoredAnonymitySet | undefined,
): Promise<{ coins: string[][]; isFullReplacement: boolean }> => {
  const localCoinsCount = localSet?.coins?.length ?? 0;
  console.log(
    '[updateCoinSet] fetchNewCoinsForSet:',
    { setId, blockHash: meta.blockHash, metaSize: meta.size, localCoinsCount },
  );

  if (!localSet || meta.size <= localCoinsCount) {
    console.log('[updateCoinSet] fetchNewCoinsForSet: performing full fetch');
    const [firstChunk, secondChunk] = await Promise.all([
      wallet.fetchAnonymitySetSector(
        setId,
        meta.blockHash,
        0,
        Math.floor(meta.size / 2),
      ),
      wallet.fetchAnonymitySetSector(
        setId,
        meta.blockHash,
        Math.floor(meta.size / 2),
        meta.size,
      ),
    ]);
    const coins = [...firstChunk.coins, ...secondChunk.coins];
    return { coins, isFullReplacement: true };
  }

  console.log('[updateCoinSet] fetchNewCoinsForSet: performing incremental fetch from', localCoinsCount);
  const sector = await wallet.fetchAnonymitySetSector(
    setId,
    meta.blockHash,
    localCoinsCount,
    meta.size,
  );

  const coins = sector.coins ?? [];
  console.log('[updateCoinSet] fetchNewCoinsForSet: fetched incremental coins count =', coins.length);
  return { coins, isFullReplacement: false };
};

export const syncCoinSetsOnce = async (): Promise<CoinSetUpdateResult[]> => {
  console.log('[updateCoinSet] syncCoinSetsOnce: start');
  const [remoteMetas, localSets, myCoinHashes] = await Promise.all([
    wallet.getAllSparkAnonymitySetMeta(),
    getLocalSets(),
    getMyCoinHashes(),
  ]);

  console.log(
    '[updateCoinSet] syncCoinSetsOnce: remoteMetas length =',
    remoteMetas,
    ', localSets length =',
    localSets,
    ', myCoinHashes size =',
    myCoinHashes,
  );

  if (!Array.isArray(remoteMetas) || remoteMetas.length === 0) {
    console.warn('[updateCoinSet] No remote metas received.');
    return [];
  }

  const updatesList = await Promise.all(remoteMetas.map(async (remoteMeta, index) => {
    const setId = index + 1;
    const localSet = localSets[index];
    console.log(
      '[updateCoinSet] syncCoinSetsOnce: iterating remoteMetas index =',
      index,
      'setId =',
      setId,
    );

    console.log('[updateCoinSet] syncCoinSetsOnce: processing setId =', setId);

    const hasLocalSet = Boolean(localSet);
    const localCoinCount = localSet?.coins?.length ?? 0;

    if (hasLocalSet) {
      const hashesMatch = remoteMeta.setHash === localSet!.setHash;
      const sizesMatch = remoteMeta.size === localCoinCount;
      console.log(
        '[updateCoinSet] syncCoinSetsOnce: hashesMatch =',
        hashesMatch,
        ', sizesMatch =',
        sizesMatch,
      );

      if (hashesMatch && sizesMatch) {
        console.log('[updateCoinSet] syncCoinSetsOnce: skipping (no changes)');
        return null;
      }
    }

    const { coins: newCoins, isFullReplacement } = await fetchNewCoinsForSet(
      setId,
      remoteMeta,
      localSet,
    );

    console.log(
      '[updateCoinSet] syncCoinSetsOnce: newCoins.length =',
      newCoins.length,
    );

    if (!newCoins.length) {
      console.log('[updateCoinSet] syncCoinSetsOnce: skipping (no new coins)');
      return null;
    }

    const updatedCoinsSet = differenceSets(
      new Set(localSets?.[index]?.coins ?? []),
      new Set(newCoins),
    );
    localSets[index] = {
      blockHash: remoteMeta.blockHash,
      setHash: remoteMeta.setHash,
      coins: [...updatedCoinsSet.values()],
    };

    if (!localSets[index] || isFullReplacement) {
      console.log(
        '[updateCoinSet] syncCoinSetsOnce: saving full replacement for index =',
        index,
      );

      await db.saveData(DB_DATA_KEYS.sets, localSets);
    } else {
      console.log(
        '[updateCoinSet] syncCoinSetsOnce: appending new sector data for index =',
        index,
      );

      await db.appendSetData(DB_DATA_KEYS.sets, index, {
        ...localSets[index],
      });
    }

    const matchedCoins = newCoins.filter(coin =>
      myCoinHashes.has(coin?.[0] ?? ''),
    );

    return {
      setId,
      blockHash: remoteMeta.blockHash,
      setHash: remoteMeta.setHash,
      newCoins,
      containsMyCoins: matchedCoins.length > 0,
      matchedCoins,
    };
  }))

  // TODO: (V) check , in some cases the length is one , and all coins are cleared
  const filtered = updatesList.filter(Boolean) as CoinSetUpdateResult[];
  console.log(
    '[updateCoinSet] syncCoinSetsOnce COMPLETED → updates =',
    filtered.length,
  );

  return filtered;
};

export const startCoinSetSync = (options?: CoinSetSyncOptions) => {
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
    console.log('[updateCoinSet] startCoinSetSync: scheduling next run in', intervalMs, 'ms');
    timer = setTimeout(run, intervalMs);
  };

  const run = async () => {
    if (isRunning) {
      console.log('[updateCoinSet] startCoinSetSync: run already in progress, scheduling next');
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
    console.log('[updateCoinSet] startCoinSetSync stopped:', stopped);
  };
};

