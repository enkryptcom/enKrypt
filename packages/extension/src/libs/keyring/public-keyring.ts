import {
  SignerType,
  Errors,
  WalletType,
  EnkryptAccount,
} from "@enkryptcom/types";
import { assert } from "chai";
import { KeyRingBase } from "./keyring";
class PublicKeyRing {
  #keyring: KeyRingBase;
  constructor() {
    this.#keyring = new KeyRingBase();
  }
  async getAccounts(types?: SignerType[]): Promise<EnkryptAccount[]> {
    return this.#keyring.getKeysArray().then((records) => {
      records.push({
        address: "0x99999990d598b918799f38163204bbc30611b6b6",
        basePath: "m/44'/60'/1'/0",
        name: "fake account #1",
        pathIndex: 0,
        publicKey: "0x0",
        signerType: SignerType.secp256k1,
        walletType: WalletType.mnemonic,
        isHardware: false,
      }); //this is a fake account for testing
      records.push({
        address: "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391",
        basePath: "m/44'/60'/1'/1",
        name: "fake account #3",
        pathIndex: 0,
        publicKey: "0x0",
        signerType: SignerType.secp256k1,
        walletType: WalletType.mnemonic,
        isHardware: false,
      }); //this is a fake account for testing
      records.push({
        address: "5FUX5eiga7k8pT6siY9KAiEhyxMAfEVgKomLB6qb2YAZakfo",
        basePath: "//",
        name: "fake account #2",
        pathIndex: 0,
        publicKey: "0x0",
        signerType: SignerType.sr25519,
        walletType: WalletType.mnemonic,
        isHardware: false,
      }); //this is a fake account for testing
      return types
        ? records.filter((r) => types.includes(r.signerType))
        : records;
    });
  }
  async getAccount(address: string): Promise<EnkryptAccount> {
    const allKeys = await this.#keyring.getKeysObject();
    assert(allKeys[address], Errors.KeyringErrors.AddressDoesntExists);
    return allKeys[address];
  }
  isLocked(): boolean {
    return this.#keyring.isLocked();
  }
  isInitialized(): Promise<boolean> {
    return this.#keyring.isInitialized();
  }
}
export default PublicKeyRing;
