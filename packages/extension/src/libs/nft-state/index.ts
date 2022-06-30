import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import { NFTInfo, StorageKey } from "./types";
class NFTState {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(InternalStorageNamespace.nftState);
  }
  async getFavoriteNFTs(): Promise<NFTInfo> {
    return this.getState(StorageKey.favoriteNFTs);
  }
  async getHiddenNFTs(): Promise<NFTInfo> {
    return this.getState(StorageKey.hiddenNFTs);
  }
  async #setNFTInfo(
    collectionIdentifier: string,
    nftID: string,
    storeKey: StorageKey
  ) {
    const state = await this.getState(storeKey);
    if (!state[collectionIdentifier]) state[collectionIdentifier] = [];
    if (!state[collectionIdentifier].includes(nftID)) {
      state[collectionIdentifier].push(nftID);
      await this.setState(state, storeKey);
    }
  }
  async #deleteNFTInfo(
    collectionIdentifier: string,
    nftID: string,
    storeKey: StorageKey
  ) {
    const state = await this.getState(storeKey);
    if (!state[collectionIdentifier]) state[collectionIdentifier] = [];
    state[collectionIdentifier] = state[collectionIdentifier].filter(
      (item) => item !== nftID
    );
    await this.setState(state, storeKey);
  }
  async setFavoriteNFT(
    collectionIdentifier: string,
    nftID: string
  ): Promise<void> {
    return this.#setNFTInfo(
      collectionIdentifier,
      nftID,
      StorageKey.favoriteNFTs
    );
  }
  async deleteFavoriteNFT(
    collectionIdentifier: string,
    nftID: string
  ): Promise<void> {
    return this.#deleteNFTInfo(
      collectionIdentifier,
      nftID,
      StorageKey.favoriteNFTs
    );
  }
  async setHiddenNFT(
    collectionIdentifier: string,
    nftID: string
  ): Promise<void> {
    return this.#setNFTInfo(collectionIdentifier, nftID, StorageKey.hiddenNFTs);
  }
  async deleteHiddenNFT(
    collectionIdentifier: string,
    nftID: string
  ): Promise<void> {
    return this.#deleteNFTInfo(
      collectionIdentifier,
      nftID,
      StorageKey.hiddenNFTs
    );
  }
  async getState(storeKey: StorageKey): Promise<Record<string, string[]>> {
    const allStates: Record<string, string[]> = await this.#storage.get(
      storeKey
    );
    if (!allStates) return {};
    return allStates;
  }
  async setState(
    state: Record<string, string[]>,
    storeKey: StorageKey
  ): Promise<void> {
    await this.#storage.set(storeKey, state);
  }
  async deleteState(storeKey: StorageKey): Promise<void> {
    await this.#storage.set(storeKey, {});
  }
  async deleteAllStates(): Promise<void> {
    const allStores = [StorageKey.favoriteNFTs, StorageKey.hiddenNFTs];
    const promises = allStores.map((store) => this.deleteState(store));
    await Promise.all(promises);
  }
}
export default NFTState;
