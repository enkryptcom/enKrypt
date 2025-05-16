import { AnonymitySetModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

export class IndexedDBHelper {
  private dbName = 'SparkDatabase';
  private storeName = 'DataStore';
  private dbVersion = 1;
  private db!: IDBDatabase;

  constructor() {
    this.initDB();
  }

  private initDB(): void {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName);
      }
    };

    request.onsuccess = () => {
      this.db = request.result;
    };

    request.onerror = () => {
      console.error('Error opening IndexedDB', request.error);
    };
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    const transaction = this.db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  async readData<T = AnonymitySetModel[]>(key: string): Promise<T> {
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

  async appendData(
    key: string,
    newItems: string[][],
    index: number,
  ): Promise<void> {
    const data = await this.readData(key);
    if (!data[index]) throw new Error('Invalid index');
    data[index].coins.push(...newItems);
    await this.saveData(key, data);
  }

  async getLength(key: string): Promise<number> {
    const data = await this.readData(key);
    return data.reduce((sum, set) => sum + set.coins.length, 0);
  }

  async getLengthOf(key: string, index: number): Promise<number> {
    const data = await this.readData(key);
    if (!data[index]) throw new Error('Invalid index');
    return data[index].coins.length;
  }
}
