import { InternalStorageNamespace } from "@/types/provider";
import Browser from "webextension-polyfill";
import BrowserStorage from "../common/browser-storage";
import { IState, StorageKeys } from "./types";
class TabState {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(InternalStorageNamespace.tabState);
  }
  async setSelectedNetwork(name: string): Promise<void> {
    const state = await this.getState();
    state.selectedNetwork = name;
    await this.setState(state);
  }
  async getSelectedNetWork(): Promise<string | null> {
    const state = await this.getState();
    if (state.selectedNetwork) return state.selectedNetwork;
    return null;
  }
  async setSelectedAddress(address: string): Promise<void> {
    const state = await this.getState();
    state.selectedAddress = address;
    await this.setState(state);
  }
  async getSelectedAddress(): Promise<string | null> {
    const state = await this.getState();
    if (state.selectedAddress) return state.selectedAddress;
    return null;
  }
  async deleteState(): Promise<void> {
    const allStates = await this.getAllStates();
    const tabId = await this.getCurrentTabId();
    if (allStates[tabId]) {
      delete allStates[tabId];
      await this.#storage.set(StorageKeys.providerInfo, allStates);
    }
  }
  async deleteStateById(id: number): Promise<void> {
    const allStates = await this.getAllStates();
    if (allStates[id]) {
      delete allStates[id];
      await this.#storage.set(StorageKeys.providerInfo, allStates);
    }
  }
  async deleteAllStates(): Promise<void> {
    return await this.#storage.remove(StorageKeys.providerInfo);
  }
  async getCurrentTabId(): Promise<number> {
    return Browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabs[0].id as number);
  }
  async setState(state: IState): Promise<void> {
    const tabId = await this.getCurrentTabId();
    const allStates = await this.getAllStates();
    allStates[tabId] = state;
    await this.#storage.set(StorageKeys.providerInfo, allStates);
  }
  async getState(): Promise<IState> {
    const allStates: Record<number, IState> = await this.getAllStates();
    const tabId = await this.getCurrentTabId();
    if (!allStates[tabId]) return {};
    else return allStates[tabId];
  }
  async getAllStates(): Promise<Record<number, IState>> {
    const allStates: Record<number, IState> = await this.#storage.get(
      StorageKeys.providerInfo
    );
    if (!allStates) return {};
    return allStates;
  }
}
export default TabState;
