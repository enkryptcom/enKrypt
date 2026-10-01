import { AnonymitySetModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

export const DB_DATA_KEYS = {
  sets: 'sets',
  myCoins: 'myCoins',
  usedCoinsTags: 'usedCoinsTags',
  sparkBalance: 'sparkBalance',
  lastCheckedSetIndex: 'lastCheckedSetIndex',
  pendingSpentCoinsTags: 'pendingSpentCoinsTags',
  sparkSpendStats: 'sparkSpendStats',
} as const;

export class IndexedDBHelper {
  private dbName = 'SparkDatabase';
  private storeName = 'DataStore';
  private dbVersion = 1;
  private db!: IDBDatabase;
  // One connection shared by every helper instance in this context.
  private static dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDB().catch(() => undefined);
  }

  waitInit(): Promise<number> {
    return this.initDB().then(() => 1);
  }

  private initDB(): Promise<IDBDatabase> {
    if (!IndexedDBHelper.dbPromise) {
      IndexedDBHelper.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Error opening IndexedDB', request.error);
          // Allow a later call to retry the open.
          IndexedDBHelper.dbPromise = null;
          reject(request.error);
        };
      });
    }
    return IndexedDBHelper.dbPromise.then(db => {
      this.db = db;
      return db;
    });
  }

  async resetDB() {
    if (!this.db) throw new Error('Missing db');
    await Promise.all(Object.values(DB_DATA_KEYS).map(v => this.clearData(v)));
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error('Missing db');
    const transaction = this.db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  async readData<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearData(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readwrite');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveData<T>(key: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore('readwrite');
      const request = store.put(data, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async appendData(key: string, data: any[]): Promise<void> {
    const oldData = await this.readData<any[]>(key);
    const newData = (oldData || []).concat(data);
    await this.saveData(key, newData);
  }

  async appendSetData(
    key: string,
    index: number,
    input: {
      coins: string[][];
      setHash: string;
      blockHash: string;
    },
  ): Promise<void> {
    const data = await this.readData<Record<number, any>>(key);
    if (!data[index]) throw new Error('Invalid index');
    data[index].blockHash = input.blockHash;
    data[index].setHash = input.setHash;
    data[index].coins = [...input.coins];
    await this.saveData(key, data);
  }

  async removeSector(
    key: string,
    index: number,
    startIndex: number,
    endIndex: number,
  ): Promise<void> {
    const data = await this.readData<Record<number, any>>(key);
    if (!data[index]) throw new Error('Invalid index');
    data[index].coins = data[index].coins.slice(startIndex, endIndex);
    await this.saveData(key, data);
  }

  async getLength(key: string): Promise<number> {
    const data = await this.readData<any[]>(key);
    return data.reduce((sum, set) => sum + set.coins.length, 0);
  }

  async getLengthOf(key: string, index?: number): Promise<number> {
    const data = await this.readData<any[]>(key);
    if (index) {
      if (!data[index]) throw new Error('Invalid index');
      return data[index].coins.length;
    }

    return data?.length;
  }

  async getBlockHashes(): Promise<string[]> {
    const data = await this.readData<any[]>(DB_DATA_KEYS.sets);
    return data.map(set => set.blockHash);
  }

  async getSetHashes(): Promise<string[]> {
    const data = await this.readData<any[]>(DB_DATA_KEYS.sets);
    return data.map(set => set.setHash);
  }

  async getSetById(id: number): Promise<AnonymitySetModel | null> {
    const data = await this.readData<any[]>(DB_DATA_KEYS.sets);
    return data[id - 1] || null;
  }
}
