import { MetadataDef } from "@polkadot/extension-inject/types";
import BrowserStorage from "@/libs/common/browser-storage";
import { PolkadotStorageNamespace } from "../types";
import { getAllNetworks } from "@/libs/utils/networks";
import { SubstrateNetwork } from "../types/substrate-network";
import { ApiPromise } from "@polkadot/api";
import { base64Encode } from "@polkadot/util-crypto";
import { isNumber } from "@polkadot/util";
import { getSpecTypes } from "@polkadot/types-known";
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
    if (!meta) {
      const targetNetwork = (await getAllNetworks()).find(
        (network) => (network as SubstrateNetwork).genesisHash === genesisHash
      );
      if (targetNetwork) {
        const api = (await targetNetwork.api()).api as ApiPromise;
        const metadata: MetadataDef = {
          chain: targetNetwork.name,
          chainType: "substrate",
          genesisHash: api.genesisHash.toHex(),
          icon: "polkadot",
          metaCalls: base64Encode(api.runtimeMetadata.asCallsOnly.toU8a()),
          specVersion: api.runtimeVersion.specVersion.toNumber(),
          ss58Format: isNumber(api.registry.chainSS58)
            ? api.registry.chainSS58
            : (targetNetwork as SubstrateNetwork).prefix,
          tokenDecimals: targetNetwork.decimals,
          tokenSymbol: targetNetwork.currencyName,
          types: getSpecTypes(
            api.registry,
            targetNetwork.name_long,
            api.runtimeVersion.specName,
            api.runtimeVersion.specVersion
          ) as unknown as Record<string, string>,
        };
        await this.addMetadata(genesisHash, JSON.stringify(metadata));
        return metadata;
      }
    }
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
