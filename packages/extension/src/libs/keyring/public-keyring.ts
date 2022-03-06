import { KeyRecord, SignerType, Errors } from "@enkryptcom/types";
import { assert } from "chai";
import { KeyRingBase } from "./keyring";
class PublicKeyRing {
  #keyring: KeyRingBase;
  constructor() {
    this.#keyring = new KeyRingBase();
  }
  async getAccounts(types?: SignerType[]): Promise<KeyRecord[]> {
    return this.#keyring.getKeysArray().then((records) => {
      return types ? records.filter((r) => types.includes(r.type)) : records;
    });
  }
  async getAccount(address: string): Promise<KeyRecord> {
    const allKeys = await this.#keyring.getKeysObject();
    assert(allKeys[address], Errors.KeyringErrors.AddressDoesntExists);
    return allKeys[address];
  }
  isLocked(): boolean {
    return this.#keyring.isLocked();
  }
}
export default PublicKeyRing;
