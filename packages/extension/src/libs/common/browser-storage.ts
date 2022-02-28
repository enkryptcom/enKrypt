import Storage from "@enkryptcom/storage";
import browser from "webextension-polyfill";

class BrowserStorage extends Storage {
  constructor(namespace: string) {
    super(namespace, { storage: browser.storage.local });
  }
}

export default BrowserStorage;
