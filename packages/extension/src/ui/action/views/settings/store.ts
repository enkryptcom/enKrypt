import { defineStore } from 'pinia';
import { ref } from 'vue';

import SettingsState from '@/libs/settings-state';

type Currency = {
  fiat_currency: string;
  exchange_rate: number;
  img: string;
}

export const useCurrencyStore = defineStore('currencyStore', () => {
  const settingsState = new SettingsState();
  const currentSelectedCurrency = ref<string>('USD');
  const currencyList = ref<Currency[]>([]);

  const pullFromSettingsState = async () => {
    const currencySettings = await settingsState.getCurrencySettings();
    currentSelectedCurrency.value = currencySettings.value;
  }

  const setCurrencyList = (list: Currency[]) => {
    pullFromSettingsState();
    const newList = [];
    for (const currency of list) {
      if (currency.fiat_currency === 'USD' || currency.fiat_currency === 'EUR' || currency.fiat_currency === 'JPY' || currency.fiat_currency === 'GBP' || currency.fiat_currency === 'KRW' || currency.fiat_currency === 'CAD') {
        newList.unshift(currency);
      } else {
        newList.push(currency);
      }
      currencyList.value = newList;
    };
  }

  const setSelectedCurrency = async (currency: string) => {
    currentSelectedCurrency.value = currency;
    await settingsState.setCurrencySettings({ value: currency });
  }

  return { currencyList, setCurrencyList, setSelectedCurrency, currentSelectedCurrency };
});

export { type Currency };