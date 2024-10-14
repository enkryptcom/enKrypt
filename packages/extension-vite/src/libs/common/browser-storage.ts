import Storage from "@enkryptcom/storage";
import { BrowserStorageArea } from "@enkryptcom/types";

class BrowserStorage extends Storage {
  constructor(namespace: string, storage?: BrowserStorageArea) {
    super(namespace, { storage });
  }
}

export default BrowserStorage;
