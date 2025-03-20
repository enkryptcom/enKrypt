import Browser from 'webextension-polyfill';
import { InternalStorageNamespace } from '@/types/provider';
import BrowserStorage from '@/libs/common/browser-storage';
import {
  StorageKeys,
  EVMSettingsType,
  SubstrateSettingsType,
  SettingsType,
  BtcSettingsType,
  EnkryptSettingsType,
  CurrencySettingsType,
} from './types';
import { merge } from 'lodash';

class SettingsState {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(InternalStorageNamespace.settingsState);
  }
  async getEVMSettings(): Promise<EVMSettingsType> {
    const DEFUALT_ETH_TTL = 60 * 60 * 1000;
    const state = await this.getStateByKey(StorageKeys.evmState);
    const settings: EVMSettingsType = {
      inject: { disabled: false, timestamp: 0 },
    };
    const merged: EVMSettingsType = merge(settings, state);
    const currentTime = new Date().getTime();
    merged.inject.disabled =
      merged.inject.timestamp + DEFUALT_ETH_TTL < currentTime
        ? false
        : merged.inject.disabled;
    return merged;
  }
  async getSubstrateSettings(): Promise<SubstrateSettingsType> {
    const state = await this.getStateByKey(StorageKeys.substrateState);
    const settings: SubstrateSettingsType = {
      injectPolkadotjs: false,
    };
    return merge(settings, state);
  }
  async getBtcSettings(): Promise<BtcSettingsType> {
    const state = await this.getStateByKey(StorageKeys.btcState);
    const settings: BtcSettingsType = {
      injectUnisat: false,
    };
    return merge(settings, state);
  }
  async getEnkryptSettings(): Promise<EnkryptSettingsType> {
    const state = await this.getStateByKey(StorageKeys.enkryptState);
    const settings: EnkryptSettingsType = {
      installedTimestamp: 0,
      randomUserID: '',
      isMetricsEnabled: true,
    };
    return merge(settings, state);
  }
  async deleteStateByKey(key: string): Promise<void> {
    await this.#storage.remove(key);
  }
  async deleteAllStates(): Promise<void> {
    return await this.#storage.clear();
  }
  async setEVMSettings(state: EVMSettingsType): Promise<void> {
    await this.#storage.set(StorageKeys.evmState, state);
  }
  async setEnkryptSettings(state: EnkryptSettingsType): Promise<void> {
    await this.#storage.set(StorageKeys.enkryptState, state);
  }
  async setSubstrateSettings(state: SubstrateSettingsType): Promise<void> {
    await this.#storage.set(StorageKeys.substrateState, state);
  }
  async setBtcSettings(state: BtcSettingsType): Promise<void> {
    await this.#storage.set(StorageKeys.btcState, state);
  }

  async setCurrencySettings(state: CurrencySettingsType): Promise<void> {
    await this.#storage.set(StorageKeys.currencyState, state);
  }

  async getCurrencySettings(): Promise<CurrencySettingsType> {
    const state = await this.getStateByKey(StorageKeys.currencyState);
    const settings: CurrencySettingsType = {
      value: 'USD',
    };
    return merge(settings, state);
  }

  async getAllSettings(): Promise<SettingsType> {
    const evmstate = await this.getEVMSettings();
    const substratestate = await this.getSubstrateSettings();
    const btcstate = await this.getBtcSettings();
    const enkryptState = await this.getEnkryptSettings();
    const currencySettingsState = await this.getCurrencySettings();
    return {
      evm: evmstate,
      substrate: substratestate,
      btc: btcstate,
      enkrypt: enkryptState,
      currencySettingsState: currencySettingsState,
      manifestVersion: Browser.runtime.getManifest().manifest_version,
    };
  }
  async getStateByKey(key: string): Promise<any> {
    const state = await this.#storage.get(key);
    if (!state) return {};
    else return state;
  }
}
export default SettingsState;
