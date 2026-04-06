import MarketData from '@/libs/market-data';
import { BaseNetwork } from '@/types/base-network';
import { computed, ref, watch, onMounted, Ref } from 'vue';
import { AccountsHeaderData } from '../types/account';
import { formatFloatingPointValue } from '../utils/filters';
const defaultFiatVal = '0.00';
export default (
  network: Ref<BaseNetwork>,
  accountInfo: Ref<AccountsHeaderData>,
) => {
  const marketData = new MarketData();
  const fiatAmount = ref<string>(defaultFiatVal);
  const tokenPrice = ref<string>(defaultFiatVal);
  const priceChangePercentage = ref<number>(0);
  const sparkline = ref<string>('');

  const cryptoAmountRaw = computed(() => {
    const selectedAccountIdx = accountInfo.value.activeAccounts.findIndex(
      acc => acc.address === accountInfo.value.selectedAccount?.address,
    );
    if (selectedAccountIdx > -1) {
      const balance = accountInfo.value.activeBalances[selectedAccountIdx];
      return balance;
    }
    return '0';
  });

  const cryptoAmount = computed(() => {
    return cryptoAmountRaw.value !== '~'
      ? formatFloatingPointValue(cryptoAmountRaw.value).value
      : cryptoAmountRaw.value;
  });

  const updateFiatValues = async () => {
    fiatAmount.value = defaultFiatVal;
    tokenPrice.value = defaultFiatVal;
    priceChangePercentage.value = 0;
    sparkline.value = '';
    if (network.value.coingeckoID && cryptoAmountRaw.value != '~') {
      const market = await marketData.getMarketData([network.value.coingeckoID]);
      fiatAmount.value = `${await marketData.getTokenValue(
        cryptoAmountRaw.value,
        network.value.coingeckoID,
        'USD',
      )}`;
      if (market && market[0]) {
        tokenPrice.value = market[0].current_price?.toString() || defaultFiatVal;
        priceChangePercentage.value = market[0].price_change_percentage_24h || 0;
        sparkline.value = JSON.stringify(market[0].sparkline_in_24h.price);
      }
    }
  };
  watch(cryptoAmount, updateFiatValues);
  onMounted(() => {
    updateFiatValues();
  });
  return {
    cryptoAmount,
    fiatAmount,
    tokenPrice,
    priceChangePercentage,
    sparkline,
  };
};
