import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';

export type PendingSpentCoinTag = {
  tag: string;
  txid: string;
  timestamp: number;
};

export const PENDING_SPENT_TTL_MS = 60 * 60 * 1000;

const db = new IndexedDBHelper();

export const getActivePendingSpentTags = async (): Promise<
  PendingSpentCoinTag[]
> => {
  const pendingSpentCoinsTags = await db.readData<PendingSpentCoinTag[]>(
    DB_DATA_KEYS.pendingSpentCoinsTags,
  );
  const now = Date.now();
  return (pendingSpentCoinsTags ?? []).filter(
    entry => now - entry.timestamp < PENDING_SPENT_TTL_MS,
  );
};

export const markCoinsAsPendingSpent = async (
  tags: string[],
  txid: string,
): Promise<void> => {
  if (!tags.length) return;

  const activePendingSpentTags = await getActivePendingSpentTags();
  const timestamp = Date.now();

  const updatedPendingSpentTags = [
    ...activePendingSpentTags,
    ...tags.map(tag => ({ tag, txid, timestamp })),
  ];

  await db.saveData(
    DB_DATA_KEYS.pendingSpentCoinsTags,
    updatedPendingSpentTags,
  );
};
