import { BrowserStorageArea } from "@enkryptcom/types";
import LocalForageLib from "localforage";

class LocalForage implements BrowserStorageArea {
  namespace: string;

  private storage: globalThis.LocalForage;

  constructor(
    namespace: string,
    drivers: Array<string> = [
      LocalForageLib.INDEXEDDB,
      LocalForageLib.LOCALSTORAGE,
    ]
  ) {
    this.namespace = namespace;
    this.storage = LocalForageLib.createInstance({
      name: this.namespace,
      driver: drivers,
      storeName: "enkrypt_db",
    });
  }

  async set(items: Record<string, any>): Promise<void> {
    const promises = [];
    Object.keys(items).forEach((key) => {
      promises.push(this.storage.setItem(key, items[key]));
    });
    await Promise.all(promises);
  }

  remove(key: string): Promise<void> {
    return this.storage.removeItem(key);
  }

  clear(): Promise<void> {
    return this.storage.clear();
  }

  get(key: string): Promise<Record<string, any>> {
    return this.storage.getItem(key).then((item) => {
      if (!item) return {};
      return {
        [key]: item,
      };
    });
  }

  async getWholeStorage(): Promise<Record<string, any>> {
    const storeOb = {};
    return this.storage
      .iterate((value, key) => {
        storeOb[key] = value;
      })
      .then(() => storeOb);
  }

  //   setDriver(driver: LocalForageDriver) {
  //     this.storage.defineDriver(driver);
  //     this.storage.setDriver(driver._driver);
  //   }
}

export default LocalForage;
