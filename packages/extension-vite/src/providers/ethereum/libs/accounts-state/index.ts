import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "@/libs/common/browser-storage";
import { IState, StorageKeys } from "./types";
class AccountState {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(
      InternalStorageNamespace.evmAccountsState
    );
  }
  async addApprovedAddress(address: string, domain: string): Promise<void> {
    address = address.toLowerCase();
    const state = await this.getStateByDomain(domain);
    if (state.approvedAccounts.includes(address))
      state.approvedAccounts = state.approvedAccounts.filter(
        (add) => add !== address
      ); //this will make sure latest address is always infront
    state.approvedAccounts.unshift(address);
    await this.setState(state, domain);
  }
  async removeApprovedAddress(address: string, domain: string): Promise<void> {
    address = address.toLowerCase();
    const state = await this.getStateByDomain(domain);
    if (state.approvedAccounts.includes(address)) {
      state.approvedAccounts = state.approvedAccounts.filter(
        (a) => a !== address
      );
      await this.setState(state, domain);
    }
  }
  async getApprovedAddresses(domain: string): Promise<string[]> {
    const state = await this.getStateByDomain(domain);
    if (state.approvedAccounts) {
      for (const acc of state.approvedAccounts) {
        if (acc.length !== 42) await this.removeApprovedAddress(acc, domain); // remove after a while, bug due to getting btc accounts added to evm
      }
      return state.approvedAccounts.filter((acc) => acc.length === 42);
    }
    return [];
  }
  async deleteState(domain: string): Promise<void> {
    const allStates = await this.getAllStates();
    if (allStates[domain]) {
      delete allStates[domain];
      await this.#storage.set(StorageKeys.accountsState, allStates);
    }
  }
  async isConnected(domain: string): Promise<boolean> {
    return this.getStateByDomain(domain).then(
      (res) => res.approvedAccounts.length > 0
    );
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
        approvedAccounts: [],
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
