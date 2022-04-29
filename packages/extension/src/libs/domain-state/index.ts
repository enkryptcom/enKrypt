import {
  InternalStorageNamespace,
  ProviderRequestOptions,
} from "@/types/provider";
import Browser from "webextension-polyfill";
import BrowserStorage from "../common/browser-storage";
import tabInfo from "../utils/tab-info";
import { IState, StorageKeys } from "./types";
class DomainState {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(InternalStorageNamespace.domainState);
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
    const domain = await this.getCurrentDomain();
    if (allStates[domain]) {
      delete allStates[domain];
      await this.#storage.set(StorageKeys.providerInfo, allStates);
    }
  }
  async deleteStateByDomain(domain: string): Promise<void> {
    const allStates = await this.getAllStates();
    if (allStates[domain]) {
      delete allStates[domain];
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
  async getCurrentTabInfo(): Promise<ProviderRequestOptions> {
    return Browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabInfo(tabs[0]));
  }
  async getCurrentDomain(): Promise<string> {
    return this.getCurrentTabInfo().then((info) => info.domain);
  }
  async setState(state: IState): Promise<void> {
    const domain = await this.getCurrentDomain();
    const allStates = await this.getAllStates();
    allStates[domain] = state;
    await this.#storage.set(StorageKeys.providerInfo, allStates);
  }
  async getStateByDomain(domain: string): Promise<IState> {
    const allStates: Record<string, IState> = await this.getAllStates();
    if (!allStates[domain]) return {};
    else return allStates[domain];
  }
  async getState(): Promise<IState> {
    const allStates: Record<string, IState> = await this.getAllStates();
    const domain = await this.getCurrentDomain();
    if (!allStates[domain]) return {};
    else return allStates[domain];
  }
  async getAllStates(): Promise<Record<string, IState>> {
    const allStates: Record<string, IState> = await this.#storage.get(
      StorageKeys.providerInfo
    );
    if (!allStates) return {};
    return allStates;
  }
}
export default DomainState;
