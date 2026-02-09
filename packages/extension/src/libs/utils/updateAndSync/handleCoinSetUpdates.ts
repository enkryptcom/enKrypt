import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import type { CoinSetUpdateResult, StoredAnonymitySet } from './updateCoinSet';
import { FiroWallet } from '@/providers/bitcoin/libs/firo-wallet/firo-wallet';

const db = new IndexedDBHelper();

type NormalizedSetUpdate = {
  setId: number;
  set: StoredAnonymitySet;
};

const normalizeUpdates = (
  updates: CoinSetUpdateResult[],
): NormalizedSetUpdate[] => {
  return updates
    .filter(update => Array.isArray(update.newCoins) && update.newCoins.length)
    .map(update => ({
      setId: update.setId,
      set: {
        blockHash: update.blockHash,
        setHash: update.setHash,
        coins: update.newCoins,
      },
    }));
};

const mergeCoins = (existing: string[][], incoming: string[][]): string[][] => {
  if (!existing?.length) return [...incoming];
  if (!incoming?.length) return [...existing];

  const seen = new Set(existing.map(coin => JSON.stringify(coin)));
  const merged = [...existing];

  incoming.forEach(coin => {
    const key = JSON.stringify(coin);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(coin);
  });

  return merged;
};

export const appendCoinSetUpdates = async (
  updates: CoinSetUpdateResult[],
): Promise<void> => {
  if (!updates?.length) return;

  const normalizedUpdates = normalizeUpdates(updates);
  if (!normalizedUpdates.length) return;

  const existingSets =
    (await db.readData<StoredAnonymitySet[]>(DB_DATA_KEYS.sets)) ?? [];
  const updatedSets = Array.isArray(existingSets) ? [...existingSets] : [];

  normalizedUpdates.forEach(update => {
    const setId = update.setId;
    if (!setId || setId < 1) return;
    const setIndex = setId - 1;

    const existingSet = updatedSets[setIndex];
    const mergedCoins = mergeCoins(update.set.coins, existingSet?.coins ?? []);

    updatedSets[setIndex] = {
      blockHash: update.set.blockHash,
      setHash: update.set.setHash,
      coins: mergedCoins,
    };
  });

  await db.saveData(DB_DATA_KEYS.sets, updatedSets);
};
