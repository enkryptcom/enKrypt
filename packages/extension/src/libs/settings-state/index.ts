import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "@/libs/common/browser-storage";
import {
  StorageKeys,
  EVMSettingsType,
  SubstrateSettingsType,
  SettingsType,
} from "./types";
import { merge } from "lodash";
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
      injectPolkadotjs: true,
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
  async setSubstrateSettings(state: SubstrateSettingsType): Promise<void> {
    await this.#storage.set(StorageKeys.substrateState, state);
  }
  async getAllSettings(): Promise<SettingsType> {
    const evmstate = await this.getEVMSettings();
    const substratestate = await this.getSubstrateSettings();
    return {
      evm: evmstate,
      substrate: substratestate,
    };
  }
  async getStateByKey(key: string): Promise<any> {
    const state = await this.#storage.get(key);
    if (!state) return {};
    else return state;
  }
}
export default SettingsState;
