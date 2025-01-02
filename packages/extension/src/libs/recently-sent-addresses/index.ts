import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import { IState, } from "./types";
import { NetworkNames } from "@enkryptcom/types";
import { BaseNetwork } from "@/types/base-network";

class RecentlySentAddressesState {
  #storage: BrowserStorage

  constructor() {
    this.#storage = new BrowserStorage(
      InternalStorageNamespace.recentlySentAddresses,
    );
  }

  async addRecentlySentAddress(
    network: Pick<BaseNetwork, 'name' | 'displayAddress'>,
    address: string,
  ): Promise<void> {
    const key = network.name
    const state: IState | undefined = await this.#storage.get(key)
    const newState: IState = {
      ...state,
      addresses: Array.from(new Set([
        network.displayAddress(address),
        ...(state?.addresses ?? []),
      ])).slice(0, 5),
    }
    await this.#storage.set(key, newState)
  }

  async getRecentlySentAddresses(networkName: NetworkNames): Promise<string[]> {
    const key = networkName
    const out: IState | undefined = await this.#storage.get(key)
    if (!out) return []
    return out.addresses
  }
}

export default RecentlySentAddressesState

