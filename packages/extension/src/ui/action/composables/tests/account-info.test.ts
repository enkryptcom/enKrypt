import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { createApp } from 'vue';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { EnkryptAccount } from '@enkryptcom/types';
import {
  CachedAccountInfo,
  CachedAsset,
} from '@/libs/account-cache-state/types';
import { useAccountCacheStore } from '../../store/account-cache-store';
import { useAccountsStore } from '../../store/accounts-store';
import accountInfoComposable from '../account-info';

/**
 * Stand-ins for the market data and for the stored account cache. They are
 * declared with vi.hoisted because the vi.mock factories below run before the
 * imports above.
 */
const mocks = vi.hoisted(() => {
  /**
   * Lookups wait for `until`, so a test can hold them back. The fiat value
   * lookup fails with `error`. With a `price` of null the market data request
   * has failed, which the lookups report as no market data and a value of '0'.
   */
  const market = {
    until: Promise.resolve(),
    price: 2000 as number | null,
    error: null as Error | null,
  };
  return {
    market,
    getMarketData: vi.fn(async () => {
      await market.until;
      if (market.price === null) return [null];
      return [
        {
          current_price: market.price,
          price_change_percentage_24h: 1.5,
          sparkline_in_24h: { price: [1, 2] },
        },
      ];
    }),
    accounts: {
      A: { name: 'Eth 1', address: '0xaaa' },
      B: { name: 'Eth 2', address: '0xbbb' },
    },
  };
});

vi.mock('@/libs/market-data', () => ({
  default: class {
    getMarketData = mocks.getMarketData;
    getTokenValue = async (amount: string) => {
      if (mocks.market.error) throw mocks.market.error;
      if (mocks.market.price === null) return '0';
      return (Number(amount) * mocks.market.price).toFixed(2);
    };
  },
}));
vi.mock('@/libs/account-cache-state', () => ({
  default: class {
    getEntries = async () => ({});
    setEntries = async () => {};
  },
}));
vi.mock('../../utils/filters', () => ({
  formatFloatingPointValue: (value: string) => ({ value }),
}));
// The networks and accounts stores, reduced to what the composable reads
vi.mock('../../store/networks-store', async () => {
  const { defineStore } = await import('pinia');
  const { ref } = await import('vue');
  return {
    useNetworksStore: defineStore('useNetworksStore', () => ({
      currentNetwork: ref({ name: 'ETH', coingeckoID: 'ethereum' }),
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
        activeAccounts: [mocks.accounts.A, mocks.accounts.B],
        inactiveAccounts: [],
        selectedAccount: mocks.accounts.A as { address: string } | null,
        activeBalances: ['~', '~'],
      });
      const selectedAccount = computed(() => accountInfo.value.selectedAccount);
      return { accountInfo, selectedAccount };
    }),
  };
});

const accounts = mocks.accounts as unknown as Record<'A' | 'B', EnkryptAccount>;

let pinia: Pinia;

/** Errors the composable left to Vue, such as an update started by a watcher that was rejected */
const unhandledErrors = vi.fn();

/** Runs the composable in a component, as a view does, and returns what it returned. */
const mount = () => {
  let result!: ReturnType<typeof accountInfoComposable>;
  const app = createApp({
    setup() {
      result = accountInfoComposable();
      return () => null;
    },
  });
  app.config.errorHandler = unhandledErrors;
  app.use(pinia).mount(document.createElement('div'));
  onTestFinished(() => app.unmount());
  return result;
};

/** Lets watchers and the lookups they start finish. */
const settle = () => new Promise(resolve => setTimeout(resolve));

/** Holds the market data lookups made from now on until the returned function is called. */
const holdMarketData = () => {
  let release = () => {};
  mocks.market.until = new Promise(resolve => (release = resolve));
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

/** Puts an entry in the account cache, as an earlier popup would have left it. */
const cache = (
  account: EnkryptAccount,
  values: Omit<CachedAccountInfo, 'updatedAt'>,
) => useAccountCacheStore().save(keyOf(account), values);

const savedValues = {
  balance: '1.5',
  fiatAmount: '100.00',
  tokenPrice: '66.67',
  priceChangePercentage: -2,
  sparkline: '[3,4]',
};

/** A token list, which the assets view can save before the balance block saves anything */
const savedAssets: CachedAsset[] = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
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
  },
];

/** What is computed for a balance of 2 when no market data is found */
const valuesWithoutMarket = {
  balance: '2',
  fiatAmount: '0',
  tokenPrice: '0.00',
  priceChangePercentage: 0,
  sparkline: '',
};

beforeEach(() => {
  pinia = createPinia();
  setActivePinia(pinia);
  mocks.market.until = Promise.resolve();
  mocks.market.price = 2000;
  mocks.market.error = null;
  mocks.getMarketData.mockClear();
  unhandledErrors.mockClear();
});

describe('account info composable', () => {
  describe('with nothing saved for the selection', () => {
    it('shows the balance as loading, with no market values', async () => {
      const info = mount();
      await settle();
      expect(info.cryptoAmount.value).toBe('~');
      expect(info.isCached.value).toBe(false);
      expect(info.fiatAmount.value).toBe('0.00');
      expect(info.tokenPrice.value).toBe('0.00');
      expect(info.priceChangePercentage.value).toBe(0);
      expect(info.sparkline.value).toBe('');
      expect(mocks.getMarketData).not.toHaveBeenCalled();
    });

    it('computes the values from the loaded balance and saves them', async () => {
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      await settle();
      const values = {
        fiatAmount: '4000.00',
        tokenPrice: '2000',
        priceChangePercentage: 1.5,
        sparkline: '[1,2]',
      };
      expect(info.cryptoAmount.value).toBe('2');
      expect(info.isCached.value).toBe(false);
      expect(info.fiatAmount.value).toBe(values.fiatAmount);
      expect(info.tokenPrice.value).toBe(values.tokenPrice);
      expect(info.priceChangePercentage.value).toBe(
        values.priceChangePercentage,
      );
      expect(info.sparkline.value).toBe(values.sparkline);
      expect(useAccountCacheStore().currentEntry).toMatchObject({
        balance: '2',
        ...values,
      });
    });

    it('saves the balance without market values when no market data is found', async () => {
      mocks.market.price = null;
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      await settle();
      expect(info.cryptoAmount.value).toBe('2');
      expect(info.tokenPrice.value).toBe('0.00');
      expect(useAccountCacheStore().currentEntry).toMatchObject(
        valuesWithoutMarket,
      );
    });

    it('saves the balance without market values when only a token list is saved', async () => {
      await cache(accounts.A, { assets: savedAssets });
      mocks.market.price = null;
      mount();
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      await settle();
      expect(useAccountCacheStore().currentEntry).toMatchObject({
        ...valuesWithoutMarket,
        assets: savedAssets,
      });
    });

    it('saves nothing when no account is selected', async () => {
      useAccountsStore().accountInfo.selectedAccount = null;
      const info = mount();
      await settle();
      expect(info.cryptoAmount.value).toBe('0');
      expect(useAccountCacheStore().entries).toEqual({});
    });
  });

  describe('with values saved for the selection', () => {
    it('shows the saved values while the balance loads', async () => {
      await cache(accounts.A, savedValues);
      const info = mount();
      const shown = () => ({
        balance: info.cryptoAmount.value,
        fiatAmount: info.fiatAmount.value,
        tokenPrice: info.tokenPrice.value,
        priceChangePercentage: info.priceChangePercentage.value,
        sparkline: info.sparkline.value,
      });
      expect(shown()).toEqual(savedValues);
      expect(info.isCached.value).toBe(true);
      await settle();
      expect(shown()).toEqual(savedValues);
      expect(info.isCached.value).toBe(true);
      expect(mocks.getMarketData).not.toHaveBeenCalled();
      // The cache is shown, it is not written into the accounts store
      expect(useAccountsStore().accountInfo.activeBalances).toEqual(['~', '~']);
    });

    it('shows the saved values when they are loaded after the view was created', async () => {
      const info = mount();
      await settle();
      expect(info.cryptoAmount.value).toBe('~');
      await cache(accounts.A, savedValues);
      await settle();
      expect(info.cryptoAmount.value).toBe('1.5');
      expect(info.isCached.value).toBe(true);
      expect(info.fiatAmount.value).toBe('100.00');
      expect(info.tokenPrice.value).toBe('66.67');
    });

    it('shows and saves the new values when the balance has loaded', async () => {
      await cache(accounts.A, savedValues);
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      await settle();
      expect(info.cryptoAmount.value).toBe('2');
      expect(info.isCached.value).toBe(false);
      expect(info.fiatAmount.value).toBe('4000.00');
      expect(info.tokenPrice.value).toBe('2000');
      expect(useAccountCacheStore().currentEntry).toMatchObject({
        balance: '2',
        fiatAmount: '4000.00',
        tokenPrice: '2000',
        priceChangePercentage: 1.5,
        sparkline: '[1,2]',
      });
    });

    it('computes the fiat value again when the loaded balance equals the saved one', async () => {
      await cache(accounts.A, savedValues);
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['1.5', '~'];
      await settle();
      expect(info.cryptoAmount.value).toBe('1.5');
      expect(info.isCached.value).toBe(false);
      expect(info.fiatAmount.value).toBe('3000.00');
      expect(useAccountCacheStore().currentEntry?.fiatAmount).toBe('3000.00');
    });

    it('keeps the saved fiat value on screen while the value of an equal loaded balance is computed', async () => {
      await cache(accounts.A, savedValues);
      const release = holdMarketData();
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['1.5', '~'];
      await settle();
      expect(info.isCached.value).toBe(false);
      expect(info.fiatAmount.value).toBe('100.00');
      expect(info.tokenPrice.value).toBe('66.67');
      release();
      await settle();
      expect(info.fiatAmount.value).toBe('3000.00');
      expect(info.tokenPrice.value).toBe('2000');
    });

    it('shows no fiat value while the value of a different loaded balance is computed', async () => {
      await cache(accounts.A, savedValues);
      const release = holdMarketData();
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      await settle();
      expect(info.cryptoAmount.value).toBe('2');
      expect(info.fiatAmount.value).toBe('0.00');
      // The price and the chart do not depend on the balance
      expect(info.tokenPrice.value).toBe('66.67');
      expect(info.sparkline.value).toBe('[3,4]');
      release();
      await settle();
      expect(info.fiatAmount.value).toBe('4000.00');
      expect(info.tokenPrice.value).toBe('2000');
    });

    it('shows the values computed without market data and keeps the saved ones', async () => {
      await cache(accounts.A, savedValues);
      mocks.market.price = null;
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      await settle();
      expect(info.cryptoAmount.value).toBe('2');
      expect(info.isCached.value).toBe(false);
      expect(info.fiatAmount.value).toBe('0');
      expect(info.tokenPrice.value).toBe('0.00');
      expect(info.priceChangePercentage.value).toBe(0);
      expect(info.sparkline.value).toBe('');
      expect(useAccountCacheStore().currentEntry).toMatchObject(savedValues);
    });

    it('saves the new balance when no market data is found and none is saved', async () => {
      await cache(accounts.A, { ...valuesWithoutMarket, balance: '1.5' });
      mocks.market.price = null;
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      await settle();
      expect(info.cryptoAmount.value).toBe('2');
      expect(useAccountCacheStore().currentEntry).toMatchObject(
        valuesWithoutMarket,
      );
    });

    it('shows the defaults and keeps the saved values when the fiat value cannot be computed', async () => {
      const errors = captureErrors();
      const error = new Error('offline');
      mocks.market.error = error;
      await cache(accounts.A, savedValues);
      const info = mount();
      useAccountsStore().accountInfo.activeBalances = ['1.5', '~'];
      await settle();
      expect(info.cryptoAmount.value).toBe('1.5');
      expect(info.isCached.value).toBe(false);
      expect(info.fiatAmount.value).toBe('0.00');
      expect(info.tokenPrice.value).toBe('0.00');
      expect(info.priceChangePercentage.value).toBe(0);
      expect(info.sparkline.value).toBe('');
      expect(useAccountCacheStore().currentEntry).toMatchObject(savedValues);
      expect(errors).toHaveBeenCalledTimes(1);
      expect(errors).toHaveBeenCalledWith(error);
      expect(unhandledErrors).not.toHaveBeenCalled();
    });
  });

  describe('when the selection changes', () => {
    it('shows the values saved for the newly selected account', async () => {
      await cache(accounts.A, savedValues);
      await cache(accounts.B, { balance: '7', fiatAmount: '700.00' });
      const info = mount();
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      expect(info.cryptoAmount.value).toBe('7');
      expect(info.isCached.value).toBe(true);
      expect(info.fiatAmount.value).toBe('700.00');
      expect(info.tokenPrice.value).toBe('0.00');
      expect(info.sparkline.value).toBe('');
    });

    it('saves a result for the account it was computed for and does not show it for another', async () => {
      const cacheStore = useAccountCacheStore();
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      const release = holdMarketData();
      const info = mount();
      await settle();
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      release();
      await settle();
      expect(cacheStore.entries[keyOf(accounts.A)]).toMatchObject({
        balance: '2',
        fiatAmount: '4000.00',
      });
      expect(cacheStore.entries[keyOf(accounts.B)]).toBeUndefined();
      expect(info.cryptoAmount.value).toBe('~');
      expect(info.fiatAmount.value).toBe('0.00');
      expect(info.tokenPrice.value).toBe('0.00');
    });

    it('keeps the saved values of an account that is no longer selected when no market data is found for it', async () => {
      await cache(accounts.A, savedValues);
      mocks.market.price = null;
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      const release = holdMarketData();
      mount();
      await settle();
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      release();
      await settle();
      const cacheStore = useAccountCacheStore();
      expect(cacheStore.entries[keyOf(accounts.A)]).toMatchObject(savedValues);
      expect(cacheStore.entries[keyOf(accounts.B)]).toBeUndefined();
    });

    it('ignores a failure for an account that is no longer selected', async () => {
      const errors = captureErrors();
      mocks.market.error = new Error('offline');
      await cache(accounts.B, { balance: '7', fiatAmount: '700.00' });
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      const release = holdMarketData();
      const info = mount();
      await settle();
      useAccountsStore().accountInfo.selectedAccount = accounts.B;
      await settle();
      release();
      await settle();
      expect(info.cryptoAmount.value).toBe('7');
      expect(info.fiatAmount.value).toBe('700.00');
      expect(errors).toHaveBeenCalledTimes(1);
    });

    it('drops a result that a later one for the same account has replaced', async () => {
      useAccountsStore().accountInfo.activeBalances = ['2', '~'];
      const release = holdMarketData();
      const info = mount();
      await settle();
      mocks.market.until = Promise.resolve();
      useAccountsStore().accountInfo.activeBalances = ['3', '~'];
      await settle();
      expect(info.fiatAmount.value).toBe('6000.00');
      release();
      await settle();
      expect(info.fiatAmount.value).toBe('6000.00');
      expect(useAccountCacheStore().currentEntry).toMatchObject({
        balance: '3',
        fiatAmount: '6000.00',
      });
    });
  });
});
