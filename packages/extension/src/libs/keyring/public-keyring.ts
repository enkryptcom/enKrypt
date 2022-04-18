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
      records.push({
        address: "0x99999990d598b918799f38163204bbc30611b6b6",
        basePath: "m/44'/60'/1'/0",
        name: "fake account #1",
        pathIndex: 0,
        publicKey: "0x0",
        type: SignerType.secp256k1,
      }); //this is a fake account for testing
      records.push({
        address: "5FUX5eiga7k8pT6siY9KAiEhyxMAfEVgKomLB6qb2YAZakfo",
        basePath: "//",
        name: "fake account #2",
        pathIndex: 0,
        publicKey: "0x0",
        type: SignerType.sr25519,
      }); //this is a fake account for testing
      return types ? records.filter((r) => types.includes(r.type)) : records;
    });
  }
  async getAccount(address: string): Promise<KeyRecord> {
    const allKeys = await this.#keyring.getKeysObject();
    assert(allKeys[address], Errors.KeyringErrors.AddressDoesntExists);
    return allKeys[address];
  }
  async addAccount(name: string, type: SignerType): Promise<KeyRecord> {
    assert(
      [SignerType.sr25519, SignerType.secp256k1].includes(type),
      Errors.SigningErrors.NotSupported
    );
    if (type === SignerType.secp256k1)
      return this.#keyring.addEthereumAddress(name);
    else if (type === SignerType.sr25519)
      return this.#keyring.addPolkadotAddress(name);
    throw new Error("PKeyRing: not supported");
  }
  isLocked(): boolean {
    return this.#keyring.isLocked();
  }
}
export default PublicKeyRing;
