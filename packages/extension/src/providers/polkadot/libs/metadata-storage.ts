import { MetadataDef } from "@polkadot/extension-inject/types";
import BrowserStorage from "@/libs/common/browser-storage";
import { PolkadotStorageNamespace } from "../types";
const STORE = "store";
class MetadataStorage {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(PolkadotStorageNamespace.metadata);
  }
  async addMetadata(genesisHash: string, metadata: string): Promise<void> {
    const allMetadata = await this.getAllMetadata();
    allMetadata[genesisHash] = JSON.parse(metadata);
    await this.#storage.set(STORE, allMetadata);
  }
  async getMetadata(genesisHash: string): Promise<MetadataDef | null> {
    const allMetadata = await this.getAllMetadata();
    const meta: MetadataDef | null = allMetadata[genesisHash]
      ? allMetadata[genesisHash]
      : null;
    return meta;
  }
  async deleteMetadata(genesisHash: string): Promise<void> {
    const allMetadata = await this.getAllMetadata();
    if (allMetadata[genesisHash]) {
      delete allMetadata[genesisHash];
      await this.#storage.set(STORE, allMetadata);
    }
  }
  async deleteAllMetadata(): Promise<void> {
    return await this.#storage.remove(STORE);
  }
  async getAllMetadata(): Promise<Record<string, MetadataDef>> {
    const allEvents = await this.#storage.get(STORE);
    if (!allEvents) return {};
    return allEvents;
  }
}
export default MetadataStorage;
