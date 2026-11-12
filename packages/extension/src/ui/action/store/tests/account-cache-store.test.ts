import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import { EnkryptAccount } from '@enkryptcom/types';
import AccountCacheState from '@/libs/account-cache-state';
import {
  CachedAccountInfo,
  CachedAsset,
  IState,
  StorageKeys,
} from '@/libs/account-cache-state/types';
import { BaseNetwork } from '@/types/base-network';
import { InternalStorageNamespace } from '@/types/provider';
import { useAccountCacheStore } from '../account-cache-store';
import { useAccountsStore } from '../accounts-store';
import { useNetworksStore } from '../networks-store';

/**
 * Stand-in for browser storage. It is declared with vi.hoisted because the
 * vi.mock factories below run before the imports above.
 */
const mocks = vi.hoisted(() => ({
  /** What browser storage holds, by namespace and then by key */
  stored: {} as Record<string, Record<string, unknown>>,
  /** Reads and writes wait for `until`, so a test can delay them, and fail with `error` */
  reads: { until: Promise.resolve(), error: null as Error | null, count: 0 },
  writes: {
    until: Promise.resolve(),
    error: null as Error | null,
    /** What each write was given, in the order the writes started */
    started: [] as unknown[],
  },
}));

vi.mock('@/libs/common/browser-storage', () => ({
  default: class {
    namespace: string;
    constructor(namespace: string) {
      this.namespace = namespace;
    }
    // Like browser storage, structuredClone refuses anything but plain data
    get = async (key: string) => {
      mocks.reads.count++;
      await mocks.reads.until;
      if (mocks.reads.error) throw mocks.reads.error;
      return structuredClone(mocks.stored[this.namespace]?.[key] ?? null);
    };
    set = async (key: string, value: unknown) => {
      const written = structuredClone(value);
      mocks.writes.started.push(written);
      await mocks.writes.until;
      if (mocks.writes.error) throw mocks.writes.error;
      (mocks.stored[this.namespace] ??= {})[key] = written;
    };
  },
}));
// The two stores the cache store reads the selection from, reduced to that selection
vi.mock('../networks-store', async () => {
  const { defineStore } = await import('pinia');
  const { ref } = await import('vue');
  return {
    useNetworksStore: defineStore('useNetworksStore', () => ({
      currentNetwork: ref({ name: 'ETH' }),
      currentSubNetwork: ref(''),
    })),
  };
});
vi.mock('../accounts-store', async () => {
  const { defineStore } = await import('pinia');
  const { computed, ref } = await import('vue');
  return {
    useAccountsStore: defineStore('useAccountsStore', () => {
      const accountInfo = ref({
        selectedAccount: { address: '0xaaa' } as { address: string } | null,
      });
      const selectedAccount = computed(() => accountInfo.value.selectedAccount);
      return { accountInfo, selectedAccount };
    }),
  };
});

const VERSION = '2.0.0';

/** What browser storage holds for the account cache. */
const storedState = () =>
  mocks.stored[InternalStorageNamespace.accountCacheState]?.[
    StorageKeys.accountCache
  ] as IState | undefined;

/** Puts entries in browser storage, as an earlier popup would have left them. */
const putInStorage = (
  entries: Record<string, CachedAccountInfo>,
  version = VERSION,
) => {
  mocks.stored[InternalStorageNamespace.accountCacheState] = {
    [StorageKeys.accountCache]: { version, entries },
  };
};

/** The balance of entry `a` in each write, in the order the writes started. */
const writtenBalances = () =>
  mocks.writes.started.map(state => (state as IState).entries.a?.balance);

/** Lets the reads and writes that are not held back finish. */
const settle = () => new Promise(resolve => setTimeout(resolve));

/** Records console.error calls for the current test and keeps them out of the test output. */
const captureErrors = () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  onTestFinished(() => errors.mockRestore());
  return errors;
};

const asset = (symbol: string): CachedAsset => ({
  name: symbol,
  symbol,
  icon: '',
  balance: '1',
  balancef: '1',
  balanceUSD: 1,
  balanceUSDf: '1',
  value: '1',
  valuef: '1',
  decimals: 18,
  sparkline: '',
  priceChangePercentage: 0,
});

beforeEach(() => {
  setActivePinia(createPinia());
  vi.stubGlobal('__PACKAGE_VERSION__', VERSION);
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(1000);
  mocks.stored = {};
  mocks.reads = { until: Promise.resolve(), error: null, count: 0 };
  mocks.writes = { until: Promise.resolve(), error: null, started: [] };
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('account cache state', () => {
  it('returns no entries when nothing is stored', async () => {
    expect(await new AccountCacheState().getEntries()).toEqual({});
  });

  it('returns the entries it stored', async () => {
    const entries = { a: { balance: '1', updatedAt: 1 } };
    await new AccountCacheState().setEntries(entries);
    expect(await new AccountCacheState().getEntries()).toEqual(entries);
    expect(storedState()?.version).toBe(VERSION);
  });

  it('ignores entries stored by another version of the extension', async () => {
    putInStorage({ a: { balance: '1', updatedAt: 1 } }, '1.9.0');
    expect(await new AccountCacheState().getEntries()).toEqual({});
  });
});

describe('account cache store', () => {
  describe('keys', () => {
    it('gives each network, sub-network and address its own key', () => {
      const { keyFor } = useAccountCacheStore();
      const keys = [
        keyFor('ETH', '', '0xaaa'),
        keyFor('MATIC', '', '0xaaa'),
        keyFor('ETH', '', '0xbbb'),
        keyFor('KDA', '0', 'k:aaa'),
        keyFor('KDA', '1', 'k:aaa'),
      ];
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('currentKey follows the network, the sub-network and the selected account', () => {
      const cacheStore = useAccountCacheStore();
      const networksStore = useNetworksStore();
      const accountsStore = useAccountsStore();
      expect(cacheStore.currentKey).toBe(cacheStore.keyFor('ETH', '', '0xaaa'));

      networksStore.currentNetwork = { name: 'KDA' } as unknown as BaseNetwork;
      networksStore.currentSubNetwork = '1';
      accountsStore.accountInfo.selectedAccount = {
        address: 'k:aaa',
      } as EnkryptAccount;
      expect(cacheStore.currentKey).toBe(
        cacheStore.keyFor('KDA', '1', 'k:aaa'),
      );

      networksStore.currentSubNetwork = '0';
      expect(cacheStore.currentKey).toBe(
        cacheStore.keyFor('KDA', '0', 'k:aaa'),
      );
    });

    it('currentKey is empty and there is no entry when no account is selected', () => {
      const cacheStore = useAccountCacheStore();
      useAccountsStore().accountInfo.selectedAccount = null;
      expect(cacheStore.currentKey).toBe('');
      expect(cacheStore.currentEntry).toBeUndefined();
    });
  });

  describe('load', () => {
    it('reads the stored entries', async () => {
      const cacheStore = useAccountCacheStore();
      putInStorage({
        [cacheStore.currentKey]: { balance: '1.5', updatedAt: 1 },
        other: { balance: '3', updatedAt: 2 },
      });
      expect(cacheStore.currentEntry).toBeUndefined();
      await cacheStore.load();
      expect(cacheStore.currentEntry).toEqual({ balance: '1.5', updatedAt: 1 });
      expect(Object.keys(cacheStore.entries)).toHaveLength(2);
    });

    it('reads storage once, so a later call keeps what was saved since', async () => {
      const cacheStore = useAccountCacheStore();
      putInStorage({ a: { balance: '1', updatedAt: 1 } });
      await cacheStore.load();
      await cacheStore.save('a', { balance: '2' });
      putInStorage({ a: { balance: '1', updatedAt: 1 } });
      await cacheStore.load();
      expect(cacheStore.entries.a?.balance).toBe('2');
      expect(mocks.reads.count).toBe(1);
    });

    it('keeps an entry saved before the read finished, together with the stored ones', async () => {
      const cacheStore = useAccountCacheStore();
      putInStorage({
        a: { balance: '1', updatedAt: 1 },
        b: { balance: '1', updatedAt: 1 },
      });
      let finishRead = () => {};
      mocks.reads.until = new Promise(resolve => (finishRead = resolve));
      const loading = cacheStore.load();
      const saving = cacheStore.save('a', { balance: '2' });
      finishRead();
      await Promise.all([loading, saving]);
      expect(cacheStore.entries.a?.balance).toBe('2');
      expect(cacheStore.entries.b?.balance).toBe('1');
      expect(storedState()?.entries.a?.balance).toBe('2');
      expect(storedState()?.entries.b?.balance).toBe('1');
    });

    it('keeps the stored values of an entry that was saved in part before the read finished', async () => {
      const cacheStore = useAccountCacheStore();
      putInStorage({
        a: {
          balance: '1',
          fiatAmount: '10.00',
          assets: [asset('ETH')],
          updatedAt: 1,
        },
      });
      let finishRead = () => {};
      mocks.reads.until = new Promise(resolve => (finishRead = resolve));
      const loading = cacheStore.load();
      const saving = cacheStore.save('a', { balance: '2' });
      finishRead();
      await Promise.all([loading, saving]);
      const merged = {
        balance: '2',
        fiatAmount: '10.00',
        assets: [asset('ETH')],
        updatedAt: 1000,
      };
      expect(cacheStore.entries.a).toEqual(merged);
      expect(storedState()?.entries.a).toEqual(merged);
    });

    it('logs a failed read and leaves the store empty', async () => {
      const errors = captureErrors();
      mocks.reads.error = new Error('storage failed');
      const cacheStore = useAccountCacheStore();
      await cacheStore.load();
      expect(cacheStore.entries).toEqual({});
      expect(errors).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    it('adds the values to the entry and records when it was saved', async () => {
      const cacheStore = useAccountCacheStore();
      await cacheStore.save('a', { balance: '1', fiatAmount: '10.00' });
      vi.setSystemTime(2000);
      await cacheStore.save('a', { assets: [asset('ETH')] });
      expect(cacheStore.entries.a).toEqual({
        balance: '1',
        fiatAmount: '10.00',
        assets: [asset('ETH')],
        updatedAt: 2000,
      });
    });

    it('stores the entries, so the next popup reads them', async () => {
      await useAccountCacheStore().save('a', { balance: '1' });

      setActivePinia(createPinia());
      const nextPopup = useAccountCacheStore();
      await nextPopup.load();
      expect(nextPopup.entries.a).toEqual({ balance: '1', updatedAt: 1000 });
    });

    it('stores plain data when the values are reactive', async () => {
      const assets = ref([asset('ETH')]);
      await useAccountCacheStore().save('a', { assets: assets.value });
      expect(storedState()?.entries.a?.assets).toEqual([asset('ETH')]);
    });

    it('keeps the 30 most recently saved entries', async () => {
      const cacheStore = useAccountCacheStore();
      for (let i = 1; i <= 31; i++) {
        vi.setSystemTime(i);
        await cacheStore.save(`key${i}`, { balance: `${i}` });
      }
      const keys = Object.keys(cacheStore.entries);
      expect(keys).toHaveLength(30);
      expect(keys).not.toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key31');
      expect(Object.keys(storedState()!.entries).sort()).toEqual(keys.sort());

      // Saving an entry again makes it the newest, so key3 is the next to go
      vi.setSystemTime(32);
      await cacheStore.save('key2', { balance: '2' });
      vi.setSystemTime(33);
      await cacheStore.save('key32', { balance: '32' });
      expect(Object.keys(cacheStore.entries)).toContain('key2');
      expect(Object.keys(cacheStore.entries)).not.toContain('key3');
    });

    it('keeps the entry being saved when every entry was saved at the same time', async () => {
      const cacheStore = useAccountCacheStore();
      for (let i = 1; i <= 31; i++) {
        await cacheStore.save(`key${i}`, { balance: `${i}` });
      }
      const keys = Object.keys(cacheStore.entries);
      expect(keys).toHaveLength(30);
      expect(keys).toContain('key31');
      expect(keys).not.toContain('key1');
    });

    it('starts a write only when the one before it has finished', async () => {
      const cacheStore = useAccountCacheStore();
      let finishFirstWrite = () => {};
      mocks.writes.until = new Promise(resolve => (finishFirstWrite = resolve));
      const first = cacheStore.save('a', { balance: '1' });
      await settle();
      expect(writtenBalances()).toEqual(['1']);
      // Only the first write is held back
      mocks.writes.until = Promise.resolve();
      const second = cacheStore.save('a', { balance: '2' });
      await settle();
      expect(writtenBalances()).toEqual(['1']);
      finishFirstWrite();
      await Promise.all([first, second]);
      expect(writtenBalances()).toEqual(['1', '2']);
      expect(storedState()?.entries.a?.balance).toBe('2');
    });

    it('logs a failed write and keeps the entry in memory', async () => {
      const errors = captureErrors();
      mocks.writes.error = new Error('storage failed');
      const cacheStore = useAccountCacheStore();
      await cacheStore.save('a', { balance: '1' });
      expect(cacheStore.entries.a?.balance).toBe('1');
      expect(storedState()).toBeUndefined();
      expect(errors).toHaveBeenCalledTimes(1);
    });

    it('saves nothing for an empty key', async () => {
      const cacheStore = useAccountCacheStore();
      await cacheStore.save('', { balance: '1' });
      expect(cacheStore.entries).toEqual({});
      expect(storedState()).toBeUndefined();
    });
  });
});
