export const LOCAL_STORAGE_PREFIXES = {
  wallet: 'wallet',
} as const;

export const LOCAL_STORAGE_KEYS = {
  sparkIndex: 'sparkIndex',
} as const;

export class LocalStorageHelper {
  private readonly prefix: string;

  constructor(prefix = '') {
    this.prefix = prefix ? prefix + ':' : '';
  }

  private key(key: string): string {
    return this.prefix + key;
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.key(key), JSON.stringify(value));
    } catch (e) {
      console.error(`LocalStorage set error for key "${key}"`, e);
    }
  }

  get<T>(key: string): T | undefined {
    try {
      const item = localStorage.getItem(this.key(key));
      return item ? (JSON.parse(item) as T) : undefined;
    } catch (e) {
      console.error(`LocalStorage get error for key "${key}"`, e);
      return undefined;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.key(key));
    } catch (e) {
      console.error(`LocalStorage remove error for key "${key}"`, e);
    }
  }

  exists(key: string): boolean {
    return localStorage.getItem(this.key(key)) !== null;
  }

  clearNamespace(): void {
    const toRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(this.prefix)) {
        toRemove.push(fullKey);
      }
    }

    toRemove.forEach(k => localStorage.removeItem(k));
  }
}
