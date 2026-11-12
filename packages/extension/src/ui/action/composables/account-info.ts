import MarketData from '@/libs/market-data';
import { computed, ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useNetworksStore } from '../store/networks-store';
import { useAccountsStore } from '../store/accounts-store';
import { useAccountCacheStore } from '../store/account-cache-store';
import { formatFloatingPointValue } from '../utils/filters';
const defaultFiatVal = '0.00';
/** The fiat value of the balance and the market data of the coin, while they are not known. */
const defaultFiatValues = () => ({
  fiatAmount: defaultFiatVal,
  tokenPrice: defaultFiatVal,
  priceChangePercentage: 0,
  sparkline: '',
});

/**
 * The balance block of the selected account: its native balance, the fiat value
 * of that balance and the market data of the network's coin.
 *
 * While the balance is still loading, the values that were last saved for the
 * selection in the account cache are shown, and isCached is true. When the
 * balance has loaded, the values are computed again, shown and saved. If they
 * cannot be computed, the defaults are shown and the cache is not changed.
 * Values computed without market data are shown too, but they do not replace
 * saved market data.
 */
export default () => {
  const { currentNetwork: network } = storeToRefs(useNetworksStore());
  const { accountInfo } = storeToRefs(useAccountsStore());
  const accountCacheStore = useAccountCacheStore();
  const { currentKey, currentEntry } = storeToRefs(accountCacheStore);
  const marketData = new MarketData();
  const fiatAmount = ref<string>(defaultFiatVal);
  const tokenPrice = ref<string>(defaultFiatVal);
  const priceChangePercentage = ref<number>(0);
  const sparkline = ref<string>('');
  /** Key of the selection that the four values above belong to */
  let shownKey = currentKey.value;
  /** Counts updateFiatValues calls, so that a slow call cannot overwrite a later one. */
  let lastUpdate = 0;

  /** The balance in the accounts store, '~' until it has loaded. */
  const loadedAmountRaw = computed(() => {
    const selectedAccountIdx = accountInfo.value.activeAccounts.findIndex(
      acc => acc.address === accountInfo.value.selectedAccount?.address,
    );
    if (selectedAccountIdx > -1) {
      const balance = accountInfo.value.activeBalances[selectedAccountIdx];
      return balance;
    }
    return '0';
  });

  /** The saved balance, while the balance in the accounts store is loading. */
  const cachedAmountRaw = computed(() =>
    loadedAmountRaw.value === '~' ? currentEntry.value?.balance : undefined,
  );

  const isCached = computed(() => cachedAmountRaw.value !== undefined);

  const cryptoAmountRaw = computed(
    () => cachedAmountRaw.value ?? loadedAmountRaw.value,
  );

  const cryptoAmount = computed(() => {
    return cryptoAmountRaw.value !== '~'
      ? formatFloatingPointValue(cryptoAmountRaw.value).value
      : cryptoAmountRaw.value;
  });

  const showFiatValues = (values: ReturnType<typeof defaultFiatValues>) => {
    fiatAmount.value = values.fiatAmount;
    tokenPrice.value = values.tokenPrice;
    priceChangePercentage.value = values.priceChangePercentage;
    sparkline.value = values.sparkline;
  };

  /** Shows the values saved for the current selection, or the defaults when it has none. */
  const showSavedFiatValues = () => {
    const entry = currentEntry.value;
    showFiatValues({
      fiatAmount: entry?.fiatAmount ?? defaultFiatVal,
      tokenPrice: entry?.tokenPrice ?? defaultFiatVal,
      priceChangePercentage: entry?.priceChangePercentage ?? 0,
      sparkline: entry?.sparkline ?? '',
    });
  };
  showSavedFiatValues();

  const updateFiatValues = async () => {
    const request = ++lastUpdate;
    const key = currentKey.value;
    const amount = cryptoAmountRaw.value;
    if (key !== shownKey || isCached.value) {
      shownKey = key;
      showSavedFiatValues();
    }
    // The values are computed from a loaded balance only
    if (isCached.value || amount === '~') return;
    // The saved fiat value is the value of the saved balance, so it stays on
    // screen only while the loaded balance is the same
    if (currentEntry.value?.balance !== amount) {
      fiatAmount.value = defaultFiatVal;
    }
    const isShown = () => request === lastUpdate && key === currentKey.value;
    const values = defaultFiatValues();
    const coingeckoID = network.value.coingeckoID;
    /** The coin has market data, but the lookup did not return it */
    let isMarketMissing = false;
    try {
      if (coingeckoID) {
        const market = await marketData.getMarketData([coingeckoID]);
        values.fiatAmount = `${await marketData.getTokenValue(
          amount,
          coingeckoID,
          'USD',
        )}`;
        if (market && market[0]) {
          values.tokenPrice =
            market[0].current_price?.toString() || defaultFiatVal;
          values.priceChangePercentage =
            market[0].price_change_percentage_24h || 0;
          values.sparkline = JSON.stringify(market[0].sparkline_in_24h.price);
        } else {
          isMarketMissing = true;
        }
      }
    } catch (e) {
      console.error(e);
      // Nothing is saved, and the saved values must not stay beside a loaded
      // balance
      if (isShown()) showFiatValues(defaultFiatValues());
      return;
    }
    // A result for a selection that is no longer current still belongs to its
    // own entry. A result that a later one for the same selection has replaced
    // is dropped.
    const isForItsEntry = isShown() || key !== currentKey.value;
    // The market data lookup returns nothing when its request fails, so a
    // result without market data does not replace an entry that has it. A coin
    // that never has market data is still saved, because its entry has none.
    const savedPrice = accountCacheStore.entries[key]?.tokenPrice;
    const isSavedMarketLost =
      isMarketMissing &&
      savedPrice !== undefined &&
      savedPrice !== defaultFiatVal;
    if (isForItsEntry && !isSavedMarketLost) {
      accountCacheStore.save(key, { balance: amount, ...values });
    }
    if (isShown()) showFiatValues(values);
  };
  // isCached is watched so that the values are computed again when the loaded
  // balance replaces a cached one, even if the two are equal
  watch([cryptoAmountRaw, isCached, currentKey], updateFiatValues);
  onMounted(() => {
    updateFiatValues();
  });
  return {
    cryptoAmount,
    fiatAmount,
    tokenPrice,
    priceChangePercentage,
    sparkline,
    isCached,
  };
};
