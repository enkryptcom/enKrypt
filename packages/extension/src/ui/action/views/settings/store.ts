import { defineStore } from 'pinia';
import { ref } from 'vue';

import SettingsState from '@/libs/settings-state';

type Currency = {
  fiat_currency: string;
  exchange_rate: number;
}

export const useCurrencyStore = defineStore('currencyStore', () => {
  const settingsState = new SettingsState();
  const currentSelectedCurrency = ref<string>('USD');
  const currencyList = ref<Currency[]>([]);

  const setCurrencyList = (list: Currency[]) => {
    pullFromSettingsState();
    currencyList.value = list;
  };

  const pullFromSettingsState = async () => {
    const currencySettings = await settingsState.getCurrencySettings();
    currentSelectedCurrency.value = currencySettings.value;
  }

  const setSelectedCurrency = async (currency: string) => {
    currentSelectedCurrency.value = currency;
    await settingsState.setCurrencySettings({ value: currency });
  }

  return { currencyList, setCurrencyList, setSelectedCurrency, currentSelectedCurrency };
});

export { type Currency };