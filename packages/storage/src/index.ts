import { BrowserStorageArea } from "@enkryptcom/types";
import { StorageOptions } from "./types";
import LocalForage from "./local-forage";

class Storage {
  namespace: string;

  private storage: BrowserStorageArea;

  constructor(namespace, options: StorageOptions) {
    if (!options.storage) options.storage = new LocalForage(namespace);
    this.namespace = namespace;
    this.storage = options.storage;
  }

  async get(key: string) {
    const vals = await this.storage.get(this.namespace);
    if (vals[this.namespace] && vals[this.namespace][key])
      return vals[this.namespace][key];
    return null;
  }

  async set(key: string, val: Record<string, any>) {
    let vals = await this.storage.get(this.namespace);
    vals = vals[this.namespace] ? vals[this.namespace] : {};
    vals[key] = val;
    return this.storage.set({
      [this.namespace]: vals,
    });
  }

  async remove(key: string) {
    let vals = await this.storage.get(this.namespace);
    vals = vals[this.namespace] ? vals[this.namespace] : {};
    delete vals[key];
    return this.storage.set({
      [this.namespace]: vals,
    });
  }

  async clear() {
    return this.storage.remove(this.namespace);
  }
}

export default Storage;
