import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { StoredAnonymitySet } from '@/libs/utils/updateAndSync/updateCoinSet';

const db = new IndexedDBHelper();

export const getSetsFromDb = async (): Promise<StoredAnonymitySet[]> => {
  try {
    const data =
      (await db.readData<StoredAnonymitySet[]>(DB_DATA_KEYS.sets)) ?? [];
    if (Array.isArray(data)) {
      return data;
    } else {
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
