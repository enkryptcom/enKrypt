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
  private async getKeysObject(): Promise<{ [key: string]: EnkryptAccount }> {
    const allKeys = await this.#keyring.getKeysObject();
    if (process.env.IS_DEV) {
      allKeys["0x99999990d598b918799f38163204bbc30611b6b6"] = {
        address: "0x99999990d598b918799f38163204bbc30611b6b6",
        basePath: "m/44'/60'/1'/0",
        name: "fake account #1",
        pathIndex: 0,
        publicKey: "0x0",
        signerType: SignerType.secp256k1,
        walletType: WalletType.mnemonic,
        isHardware: false,
      };
      allKeys["0xb1ea5a3e5ea7fa1834d48058ecda26d8c59e8251"] = {
        address: "0xb1ea5a3e5ea7fa1834d48058ecda26d8c59e8251", //optimism nfts
        basePath: "m/44'/60'/2'/0",
        name: "fake account #2",
        pathIndex: 0,
        publicKey: "0x0",
        signerType: SignerType.secp256k1,
        walletType: WalletType.mnemonic,
        isHardware: false,
      };
      allKeys["0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391"] = {
        address: "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391",
        basePath: "m/44'/60'/1'/1",
        name: "fake ledger account #3",
        pathIndex: 0,
        publicKey: "0x0",
        signerType: SignerType.secp256k1,
        walletType: WalletType.ledger,
        isHardware: true,
      };
      allKeys["5E56EZk6jmpq1q3Har3Ms99D9TLN9ra2inFh7Q1Hj6GpUx6D"] = {
        address: "5E56EZk6jmpq1q3Har3Ms99D9TLN9ra2inFh7Q1Hj6GpUx6D",
        basePath: "//",
        name: "fake ledger account #2",
        pathIndex: 0,
        publicKey: "0x0",
        signerType: SignerType.sr25519,
        walletType: WalletType.ledger,
        isHardware: true,
      };
      allKeys["5E56EZk6jmpq1q3Har3Ms99D9TLN9ra2inFh7Q1Hj6GpUx6D"] = {
        address: "5CFnoCsP3pDK2thhSqYPwKELJFLQ1hBodqzSUypexyh7eHkB",
        basePath: "//",
        name: "fake account #4",
        pathIndex: 0,
        publicKey: "0x0",
        signerType: SignerType.sr25519,
        walletType: WalletType.mnemonic,
        isHardware: false,
      };
    }
    return allKeys;
  }
  async getAccounts(types?: SignerType[]): Promise<EnkryptAccount[]> {
    return this.getKeysObject().then((keysObject) => {
      const records = Object.values(keysObject);
      return types
        ? records.filter((r) => types.includes(r.signerType))
        : records;
    });
  }
  async getAccount(address: string): Promise<EnkryptAccount> {
    const allKeys = await this.getKeysObject();
    assert(allKeys[address], Errors.KeyringErrors.AddressDoesntExists);
    return allKeys[address];
  }
  isLocked(): boolean {
    return this.#keyring.isLocked();
  }
  isInitialized(): Promise<boolean> {
    return this.#keyring.isInitialized();
  }
  async accountAlreadyAdded(newAddress: string): Promise<boolean> {
    newAddress = newAddress.toLowerCase();

    const allAccounts = await this.getAccounts();

    let alreadyExists = false;

    for (const account of allAccounts) {
      if (account.address.toLowerCase() === newAddress) {
        alreadyExists = true;
        break;
      }
    }

    return alreadyExists;
  }
}
export default PublicKeyRing;
