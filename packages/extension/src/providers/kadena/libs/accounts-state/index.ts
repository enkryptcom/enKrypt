import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "@/libs/common/browser-storage";
import { IState, StorageKeys } from "./types";
import { defaultChainId } from "../../types";

class AccountState {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(
      InternalStorageNamespace.kadenaAccountsState
    );
  }
  async addApprovedDomain(domain: string): Promise<void> {
    const state = await this.getStateByDomain(domain);
    state.isApproved = true;
    await this.setState(state, domain);
  }
  async removeApprovedDomain(domain: string): Promise<void> {
    const state = await this.getStateByDomain(domain);
    state.isApproved = false;
    await this.setState(state, domain);
  }
  async isApproved(domain: string): Promise<boolean> {
    const state = await this.getStateByDomain(domain);
    return state.isApproved;
  }
  async deleteState(domain: string): Promise<void> {
    const allStates = await this.getAllStates();
    if (allStates[domain]) {
      delete allStates[domain];
      await this.#storage.set(StorageKeys.accountsState, allStates);
    }
  }
  async setChainId(chainId: string): Promise<void> {
    await this.#storage.set(StorageKeys.chainIdState, {
      [StorageKeys.chainIdState]: chainId as any,
    });
  }
  async getChainId(): Promise<string> {
    const allStates: any = await this.#storage.get(StorageKeys.chainIdState);
    if (!allStates) return defaultChainId;
    return allStates[StorageKeys.chainIdState];
  }
  async isConnected(domain: string): Promise<boolean> {
    return this.getStateByDomain(domain).then((res) => res.isApproved);
  }
  async deleteAllStates(): Promise<void> {
    return await this.#storage.remove(StorageKeys.accountsState);
  }
  async setState(state: IState, domain: string): Promise<void> {
    const allStates = await this.getAllStates();
    allStates[domain] = state;
    await this.#storage.set(StorageKeys.accountsState, allStates);
  }
  async getStateByDomain(domain: string): Promise<IState> {
    const allStates: Record<string, IState> = await this.getAllStates();
    if (!allStates[domain])
      return {
        isApproved: false,
      };
    else return allStates[domain];
  }
  async getAllStates(): Promise<Record<string, IState>> {
    const allStates: Record<string, IState> = await this.#storage.get(
      StorageKeys.accountsState
    );
    if (!allStates) return {};
    return allStates;
  }
}
export default AccountState;
