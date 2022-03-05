import KeyRing from "@enkryptcom/keyring";
import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import { KeyRecord, SignerType } from "@enkryptcom/types";
class PublicKeyRing {
  #keyring: KeyRing;
  constructor() {
    const browserStorage = new BrowserStorage(InternalStorageNamespace.keyring);
    this.#keyring = new KeyRing(browserStorage);
  }
  async getAccounts(types?: Array<SignerType>): Promise<Array<KeyRecord>> {
    return this.#keyring.getKeysArray().then((records) => {
      return types ? records.filter((r) => types.includes(r.type)) : records;
    });
  }
}
export default PublicKeyRing;
