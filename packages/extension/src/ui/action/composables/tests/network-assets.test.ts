import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { createApp } from 'vue';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { EnkryptAccount } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import { AssetsType } from '@/types/provider';
import { useAccountCacheStore } from '../../store/account-cache-store';
import { useAccountsStore } from '../../store/accounts-store';
import { useNetworksStore } from '../../store/networks-store';
import networkAssetsComposable from '../network-assets';

/**
 * Stand-in for the network's asset lookup. It is declared with vi.hoisted
 * because the vi.mock factories below run before the imports above.
 */
const mocks = vi.hoisted(() => {
  const lookups = {
    /** A lookup waits for the `until` and fails with the `error` set when it starts */
    until: Promise.resolve(),
    error: null as Error | null,
    /** The assets each address holds */
    byAddress: {} as Record<string, unknown[]>,
  };
  return {
    lookups,
    getAllTokenInfo: vi.fn(async (address: string) => {
      const { until, error } = lookups;
      const assets = lookups.byAddress[address] ?? [];
      await until;
      if (error) throw error;
      return assets;
    }),
    accounts: {
      A: { name: 'Eth 1', address: '0xaaa' },
      B: { name: 'Eth 2', address: '0xbbb' },
    },
  };
});

vi.mock('@/libs/account-cache-state', () => ({
  default: class {
    getEntries = async () => ({});
    setEntries = async () => {};
  },
}));
// The networks and accounts stores, reduced to what the composable reads
vi.mock('../../store/networks-store', async () => {
  const { defineStore } = await import('pinia');
  const { ref } = await import('vue');
  return {
    useNetworksStore: defineStore('useNetworksStore', () => ({
      currentNetwork: ref({
        name: 'ETH',
        getAllTokenInfo: mocks.getAllTokenInfo,
      }),
      currentSubNetwork: ref(''),
    })),
  };
});
vi.mock('../../store/accounts-store', async () => {
  const { defineStore } = await import('pinia');
  const { computed, ref } = await import('vue');
  return {
    useAccountsStore: defineStore('useAccountsStore', () => {
      const accountInfo = ref({
        selectedAccount: mocks.accounts.A as { address: string } | null,
      });
      const selectedAccount = computed(() => accountInfo.value.selectedAccount);
      return { accountInfo, selectedAccount };
    }),
  };
});

const accounts = mocks.accounts as unknown as Record<'A' | 'B', EnkryptAccount>;

const asset = (symbol: string, balance = '1'): AssetsType => ({
  name: symbol,
  symbol,
  icon: '',
  balance,
  balancef: balance,
  balanceUSD: 1,
  balanceUSDf: '1',
  value: '1',
  valuef: '1',
  decimals: 18,
  sparkline: '',
  priceChangePercentage: 0,
});

let pinia: Pinia;

/** Runs the composable in a component, as the assets view does, and returns what it returned. */
const mount = () => {
  let result!: ReturnType<typeof networkAssetsComposable>;
  const app = createApp({
    setup() {
      result = networkAssetsComposable();
      return () => null;
    },
  });
  app.use(pinia).mount(document.createElement('div'));
  onTestFinished(() => app.unmount());
  return result;
};

/** Lets watchers and the lookups they start finish. */
const settle = () => new Promise(resolve => setTimeout(resolve));

/** Holds the lookups started from now on until the returned function is called. */
const holdLookups = () => {
  let release = () => {};
  mocks.lookups.until = new Promise(resolve => (release = resolve));
  return release;
};

/** Records console.error calls for the current test and keeps them out of the test output. */
const captureErrors = () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  onTestFinished(() => errors.mockRestore());
  return errors;
};

/** The key of an account on the network the tests use. */
const keyOf = (account: EnkryptAccount) =>
  useAccountCacheStore().keyFor('ETH', '', account.address);

/** The symbols of a list of assets, in order. */
const symbols = (assets: { symbol: string }[] | undefined) =>
  assets?.map(a => a.symbol);

beforeEach(() => {
  pinia = createPinia();
  setActivePinia(pinia);
  mocks.lookups.until = Promise.resolve();
  mocks.lookups.error = null;
  mocks.lookups.byAddress = {
    '0xaaa': [asset('ETH'), asset('DAI')],
    '0xbbb': [asset('USDC')],
  };
  mocks.getAllTokenInfo.mockClear();
});

describe('network assets composable', () => {
  describe('with nothing saved for the selection', () => {
    it('shows the list as loading, then the loaded list', async () => {
      const release = holdLookups();
      const list = mount();
      await settle();
      expect(list.isLoading.value).toBe(true);
      expect(list.assets.value).toEqual([]);
      release();
      await settle();
      expect(list.isLoading.value).toBe(false);
      expect(list.isFetchError.value).toBe(false);
      expect(symbols(list.assets.value)).toEqual(['ETH', 'DAI']);
      expect(mocks.getAllTokenInfo).toHaveBeenCalledWith('0xaaa');
    });

    it('saves the loaded list, without baseToken', async () => {
      const dot = { ...asset('DOT'), baseToken: { name: 'Polkadot' } };
      mocks.lookups.byAddress['0xaaa'] = [dot];
      const list = mount();
      await settle();
      expect(list.assets.value[0]?.baseToken).toBeDefined();
      const saved = useAccountCacheStore().currentEntry?.assets;
      expect(saved).toEqual([asset('DOT')]);
      expect(saved?.[0]).not.toHaveProperty('baseToken');
    });

    it('saves an empty list', async () => {
      mocks.lookups.byAddress['0xaaa'] = [];
      const list = mount();
      await settle();
      expect(list.assets.value).toEqual([]);
      expect(useAccountCacheStore().currentEntry?.assets).toEqual([]);
    });

    it('shows the list as loading and loads nothing when no account is selected', async () => {
      useAccountsStore().accountInfo.selectedAccount = null;
      const list = mount();
      await settle();
      expect(list.isLoading.value).toBe(true);
      expect(list.assets.value).toEqual([]);
      expect(mocks.getAllTokenInfo).not.toHaveBeenCalled();
    });

    it('clears the list and reports the error when loading fails', async () => {
      const errors = captureErrors();
      mocks.lookups.error = new Error('offline');
      const list = mount();
      await settle();
      expect(list.isFetchError.value).toBe(true);
      expect(list.isLoading.value).toBe(false);
      expect(list.assets.value).toEqual([]);
      expect(errors).toHaveBeenCalledTimes(1);
    });
  });

  describe('with a list saved for the selection', () => {
    beforeEach(() =>
      useAccountCacheStore().save(keyOf(accounts.A), {
        assets: [asset('ETH', '0.5')],
      }),
    );

    it('shows the saved list while the new one loads, then shows and saves the new one', async () => {
      const release = holdLookups();
      const list = mount();
      await settle();
      expect(list.isLoading.value).toBe(false);
      expect(list.assets.value).toEqual([asset('ETH', '0.5')]);
      release();
      await settle();
      expect(list.isLoading.value).toBe(false);
      expect(symbols(list.assets.value)).toEqual(['ETH', 'DAI']);
      expect(symbols(useAccountCacheStore().currentEntry?.assets)).toEqual([
        'ETH',
        'DAI',
      ]);
    });

    it('clears the saved list and reports the error when loading fails', async () => {
      const errors = captureErrors();
      mocks.lookups.error = new Error('offline');
      const list = mount();
      await settle();
      expect(list.isFetchError.value).toBe(true);
      expect(list.isLoading.value).toBe(false);
      expect(list.assets.value).toEqual([]);
      expect(errors).toHaveBeenCalledTimes(1);
    });

    it('shows an empty loaded list and keeps the saved one', async () => {
      mocks.lookups.byAddress['0xaaa'] = [];
      const list = mount();
      await settle();
      expect(list.assets.value).toEqual([]);
      expect(list.isLoading.value).toBe(false);
      expect(list.isFetchError.value).toBe(false);
      expect(useAccountCacheStore().currentEntry?.assets).toEqual([
        asset('ETH', '0.5'),
      ]);
    });

    it('shows the saved list again when the list is refreshed', async () => {
      const list = mount();
      await settle();
      const release = holdLookups();
      list.updateAssets();
      expect(list.isLoading.value).toBe(false);
      expect(symbols(list.assets.value)).toEqual(['ETH', 'DAI']);
      release();
      await settle();
    });
  });

  describe('when the selection changes', () => {
    it('loads the list of the new account, network or sub-network', async () => {
      const list = mount();
      await settle();
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      expect(mocks.getAllTokenInfo).toHaveBeenLastCalledWith('0xbbb');
      expect(symbols(list.assets.value)).toEqual(['USDC']);

      const networksStore = useNetworksStore();
      networksStore.currentSubNetwork = '1';
      await settle();
      expect(mocks.getAllTokenInfo).toHaveBeenCalledTimes(3);

      networksStore.currentNetwork = {
        name: 'MATIC',
        getAllTokenInfo: mocks.getAllTokenInfo,
      } as unknown as BaseNetwork;
      await settle();
      expect(mocks.getAllTokenInfo).toHaveBeenCalledTimes(4);
    });

    it('saves a list for the account it was loaded for and does not show it for another', async () => {
      const cacheStore = useAccountCacheStore();
      const release = holdLookups();
      const list = mount();
      await settle();
      mocks.lookups.until = Promise.resolve();
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      expect(symbols(list.assets.value)).toEqual(['USDC']);
      release();
      await settle();
      expect(symbols(list.assets.value)).toEqual(['USDC']);
      expect(symbols(cacheStore.entries[keyOf(accounts.A)]?.assets)).toEqual([
        'ETH',
        'DAI',
      ]);
      expect(symbols(cacheStore.entries[keyOf(accounts.B)]?.assets)).toEqual([
        'USDC',
      ]);
    });

    it('ignores a failure for an account that is no longer selected', async () => {
      const errors = captureErrors();
      mocks.lookups.error = new Error('offline');
      const release = holdLookups();
      const list = mount();
      await settle();
      mocks.lookups.until = Promise.resolve();
      mocks.lookups.error = null;
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      release();
      await settle();
      expect(list.isFetchError.value).toBe(false);
      expect(symbols(list.assets.value)).toEqual(['USDC']);
      expect(errors).toHaveBeenCalledTimes(1);
    });

    it('drops a list that a later one for the same account has replaced', async () => {
      const release = holdLookups();
      const list = mount();
      await settle();
      mocks.lookups.until = Promise.resolve();
      mocks.lookups.byAddress['0xaaa'] = [
        asset('ETH'),
        asset('DAI'),
        asset('UNI'),
      ];
      list.updateAssets();
      await settle();
      expect(symbols(list.assets.value)).toEqual(['ETH', 'DAI', 'UNI']);
      release();
      await settle();
      expect(symbols(list.assets.value)).toEqual(['ETH', 'DAI', 'UNI']);
      expect(symbols(useAccountCacheStore().currentEntry?.assets)).toEqual([
        'ETH',
        'DAI',
        'UNI',
      ]);
    });
  });

  // The view keys its rows by the version, so that every list gets new rows
  describe('list version', () => {
    it('changes when the saved list is shown and when the loaded list replaces it', async () => {
      await useAccountCacheStore().save(keyOf(accounts.B), {
        assets: [asset('USDC', '0.5')],
      });
      const list = mount();
      await settle();
      const versions = [list.listVersion.value];
      const release = holdLookups();
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      expect(list.assets.value).toEqual([asset('USDC', '0.5')]);
      versions.push(list.listVersion.value);
      release();
      await settle();
      expect(list.assets.value).toEqual([asset('USDC')]);
      versions.push(list.listVersion.value);
      expect(new Set(versions).size).toBe(3);
    });

    it('changes when a failure clears the list', async () => {
      captureErrors();
      await useAccountCacheStore().save(keyOf(accounts.A), {
        assets: [asset('ETH', '0.5')],
      });
      mocks.lookups.error = new Error('offline');
      const release = holdLookups();
      const list = mount();
      await settle();
      expect(list.assets.value).toEqual([asset('ETH', '0.5')]);
      const savedListVersion = list.listVersion.value;
      release();
      await settle();
      expect(list.assets.value).toEqual([]);
      expect(list.listVersion.value).not.toBe(savedListVersion);
    });

    it('stays the same when a list arrives for an account that is no longer selected', async () => {
      const release = holdLookups();
      const list = mount();
      await settle();
      mocks.lookups.until = Promise.resolve();
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      const shownVersion = list.listVersion.value;
      release();
      await settle();
      expect(symbols(list.assets.value)).toEqual(['USDC']);
      expect(list.listVersion.value).toBe(shownVersion);
    });

    it('stays the same when a list arrives after a later one for the same account', async () => {
      const release = holdLookups();
      const list = mount();
      await settle();
      mocks.lookups.until = Promise.resolve();
      list.updateAssets();
      await settle();
      const shownVersion = list.listVersion.value;
      release();
      await settle();
      expect(list.listVersion.value).toBe(shownVersion);
    });
  });
});
