import KeyRing from "@enkryptcom/keyring";
import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import {
  EnkryptAccount,
  HWWalletAdd,
  KeyPairAdd,
  KeyRecordAdd,
  SignerType,
  SignOptions,
  WalletType,
} from "@enkryptcom/types";
export class KeyRingBase {
  #keyring: KeyRing;
  constructor() {
    const browserStorage = new BrowserStorage(InternalStorageNamespace.keyring);
    this.#keyring = new KeyRing(browserStorage);
  }
  init(mnemonic: string, password: string): Promise<void> {
    return this.#keyring.init(password, { mnemonic });
  }
  async reset(): Promise<void> {
    const resetPromises = Object.values(InternalStorageNamespace).map((name) =>
      new BrowserStorage(name).clear()
    );
    await Promise.all(resetPromises);
  }
  getNewAccount(options: {
    basePath: string;
    signerType: SignerType;
  }): Promise<EnkryptAccount> {
    return this.#keyring.createKey({
      name: "",
      basePath: options.basePath,
      signerType: options.signerType,
      walletType: WalletType.mnemonic,
    });
  }
  saveNewAccount(options: KeyRecordAdd): Promise<EnkryptAccount> {
    return this.#keyring.createAndSaveKey(options);
  }
  sign(
    hexMessage: `0x${string}`,
    options: SignOptions
  ): Promise<`0x${string}`> {
    return this.#keyring
      .sign(hexMessage, options)
      .then((hex: string) => hex as `0x${string}`);
  }
  getEthereumEncryptionPublicKey(options: SignOptions): Promise<string> {
    return this.#keyring.getEthereumEncryptionPublicKey(options);
  }
  ethereumDecrypt(
    encryptedMessage: string,
    options: SignOptions
  ): Promise<string> {
    return this.#keyring.ethereumDecrypt(encryptedMessage, options);
  }
  getKeysArray(): Promise<EnkryptAccount[]> {
    return this.#keyring.getKeysArray();
  }
  getKeysObject(): Promise<{ [key: string]: EnkryptAccount }> {
    return this.#keyring.getKeysObject();
  }
  addHWAccount(account: HWWalletAdd): Promise<EnkryptAccount> {
    return this.#keyring.addHWAccount(account);
  }
  addKeyPair(account: KeyPairAdd, password: string): Promise<EnkryptAccount> {
    return this.#keyring.addKeyPair(account, password);
  }
  isLocked(): boolean {
    return this.#keyring.isLocked();
  }
  unlock(password: string): Promise<void> {
    return this.#keyring.unlockMnemonic(password);
  }
  lock(): void {
    return this.#keyring.lock();
  }
  getMnemonic(password: string): Promise<string> {
    return this.#keyring.getMnemonic(password);
  }
  isInitialized(): Promise<boolean> {
    return this.#keyring.isInitialized();
  }
  renameAccount(address: string, newName: string): Promise<EnkryptAccount> {
    return this.#keyring.renameAccount(address, newName);
  }
  deleteAccount(address: string): Promise<void> {
    return this.#keyring.deleteAccount(address);
  }
}
export default KeyRingBase;
