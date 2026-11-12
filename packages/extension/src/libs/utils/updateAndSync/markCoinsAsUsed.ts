import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { MyCoinModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { getActivePendingSpentTags } from '@/libs/utils/updateAndSync/markCoinsAsPendingSpent';

// txHash is the spending tx as the server sends it (base64, reversed bytes).
export type SyncedSparkCoin = MyCoinModel & { txHash?: string | null };

const db = new IndexedDBHelper();

export const markCoinsAsUsed = async (
  onBalanceCalculated?: () => void,
): Promise<SyncedSparkCoin[]> => {
  const usedCoinsTags = await db.readData<{
    tags: string[];
    txHashes: [string, string][];
  }>(DB_DATA_KEYS.usedCoinsTags);
  const coinsTagsSet = new Set(usedCoinsTags?.tags ?? []);

  const activePendingSpentTags = await getActivePendingSpentTags();
  const reconciledPendingSpentTags = activePendingSpentTags.filter(
    entry => !coinsTagsSet.has(entry.tag),
  );
  await db.saveData(
    DB_DATA_KEYS.pendingSpentCoinsTags,
    reconciledPendingSpentTags,
  );

  const myCoins = await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins);

  if (!myCoins?.length || !usedCoinsTags?.tags?.length) {
    return [];
  }

  const txHashesMap = new Map(usedCoinsTags.txHashes || []);
  console.log('>>>>txHashesMap', txHashesMap);
  const updatedCoins: SyncedSparkCoin[] = myCoins.map(coin => {
    if (!coinsTagsSet.has(coin.tag)) return coin;
    return {
      ...coin,
      isUsed: true,
      txHash: txHashesMap.get(coin.tag) || null,
    };
  });

  // Spark history is rebuilt from these coins afterwards (rebuildSparkHistory),
  // so the balance no longer waits on fetching their txs.
  await db.saveData(DB_DATA_KEYS.myCoins, updatedCoins);

  if (onBalanceCalculated) {
    try {
      onBalanceCalculated();
    } catch (err) {
      console.error('Error in onBalanceCalculated callback:', err);
    }
  }

  return updatedCoins;
};
