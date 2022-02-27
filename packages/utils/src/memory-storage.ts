import { BrowserStorageArea } from "@enkryptcom/types";

class MemoryStorage implements BrowserStorageArea {
  private storage: { [key: string]: any } = {};

  async get(key: string): Promise<Record<string, any>> {
    return this.storage[key] ? { [key]: this.storage[key] } : {};
  }

  async set(items: Record<string, any>): Promise<void> {
    Object.keys(items).forEach((key) => {
      this.storage[key] = items[key];
    });
  }

  async remove(key: string): Promise<void> {
    delete this.storage[key];
  }

  async clear(): Promise<void> {
    this.storage = {};
  }

  async getWholeStorage(): Promise<Record<string, any>> {
    return this.storage;
  }
}

export default MemoryStorage;
