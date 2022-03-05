import KeyRing from "@enkryptcom/keyring";
import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import { KeyRecord, SignerType } from "@enkryptcom/types";
class KeyRingBase {
  #keyring: KeyRing;
  constructor() {
    const browserStorage = new BrowserStorage(InternalStorageNamespace.keyring);
    this.#keyring = new KeyRing(browserStorage);
  }
  getKeysArray(): Promise<KeyRecord[]> {
    return this.#keyring.getKeysArray();
  }
}
export default KeyRingBase;
