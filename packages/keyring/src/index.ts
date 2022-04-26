import {
  KeyRecordAdd,
  KeyRecord,
  Errors,
  SignerInterface,
  SignerType,
  SignOptions,
} from "@enkryptcom/types";
import Storage from "@enkryptcom/storage";
import { entropyToMnemonic, generateMnemonic, mnemonicToEntropy } from "bip39";
import { hexToBuffer, encrypt, decrypt } from "@enkryptcom/utils";
import PolkadotSigner from "@enkryptcom/signer-polkadot";
import EthereumSigner from "@enkryptcom/signer-ethereum";
import assert from "assert";
import configs from "./configs";
import { pathParser } from "./utils";

class KeyRing {
  #storage: Storage;

  #_isLocked: boolean;

  #signers: { [key in SignerType]: SignerInterface };

  #_mnemonic: string;

  #_autoLock: number;

  readonly autoLockTime: number;

  constructor(storage: Storage, locktime = 30 * 60 * 1000) {
    this.#storage = storage;
    this.#_isLocked = true;
    this.autoLockTime = locktime;

    this.#signers = {
      [SignerType.secp256k1]: new EthereumSigner(),
      [SignerType.ecdsa]: new PolkadotSigner(SignerType.ecdsa),
      [SignerType.ed25519]: new PolkadotSigner(SignerType.ed25519),
      [SignerType.sr25519]: new PolkadotSigner(SignerType.sr25519),
    };
  }

  async init(
    password: string,
    {
      strength = configs.MNEMONIC_STRENGTH,
      mnemonic = generateMnemonic(strength),
    }: { strength?: number; mnemonic?: string } = {}
  ): Promise<void> {
    assert(
      !(await this.#storage.get(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC)),
      Errors.KeyringErrors.MnemonicExists
    );
    assert(password, Errors.KeyringErrors.NoPassword);
    const entropy = hexToBuffer(mnemonicToEntropy(mnemonic));
    const encrypted = await encrypt(entropy, password);
    await this.#storage.set(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC, encrypted);
  }

  async isInitialized(): Promise<boolean> {
    if (await this.#storage.get(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC))
      return true;
    return false;
  }

  async getPathIndex(basePath: string): Promise<number> {
    const pathIndexes =
      (await this.#storage.get(configs.STORAGE_KEYS.PATH_INDEXES)) || {};
    if (pathIndexes[basePath] === undefined) return 0;
    return pathIndexes[basePath] + 1;
  }

  private async _getMnemonic(password: string): Promise<string> {
    const encrypted = await this.#storage.get(
      configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC
    );
    assert(encrypted, Errors.KeyringErrors.NotInitialized);
    const decryptedEntropy = await decrypt(encrypted, password);
    return entropyToMnemonic(decryptedEntropy);
  }

  async unlockMnemonic(password: string): Promise<void> {
    this.#_mnemonic = await this._getMnemonic(password);
    this.#_isLocked = false;
    if (this.autoLockTime !== 0) {
      clearTimeout(this.#_autoLock);
      setTimeout(() => {
        this.#_mnemonic = null;
        this.#_isLocked = true;
      }, this.autoLockTime);
    }
  }

  async getMnemonic(password: string): Promise<string> {
    return this._getMnemonic(password);
  }

  async createKey(key: KeyRecordAdd): Promise<KeyRecord> {
    assert(!this.#_isLocked, Errors.KeyringErrors.Locked);
    const nextIndex = await this.getPathIndex(key.basePath);
    const keypair = await this.#signers[key.type].generate(
      this.#_mnemonic,
      pathParser(key.basePath, nextIndex, key.type)
    );
    return {
      address: keypair.address,
      basePath: key.basePath,
      name: key.name,
      pathIndex: nextIndex,
      publicKey: keypair.publicKey,
      type: key.type,
    };
  }

  async createAndSaveKey(key: KeyRecordAdd): Promise<KeyRecord> {
    const keyRecord = await this.createKey(key);
    const existingKeys = await this.getKeysObject();
    assert(
      !existingKeys[keyRecord.address],
      Errors.KeyringErrors.AddressExists
    );
    existingKeys[keyRecord.address] = keyRecord;
    await this.#storage.set(configs.STORAGE_KEYS.KEY_INFO, existingKeys);
    const pathIndexes =
      (await this.#storage.get(configs.STORAGE_KEYS.PATH_INDEXES)) || {};
    pathIndexes[keyRecord.basePath] = keyRecord.pathIndex;
    await this.#storage.set(configs.STORAGE_KEYS.PATH_INDEXES, pathIndexes);
    return keyRecord;
  }

  async sign(msgHash: string, options: SignOptions): Promise<string> {
    assert(!this.#_isLocked, Errors.KeyringErrors.Locked);
    const keypair = await this.#signers[options.type].generate(
      this.#_mnemonic,
      pathParser(options.basePath, options.pathIndex, options.type)
    );
    return this.#signers[options.type].sign(msgHash, keypair);
  }

  async getKeysObject(): Promise<{ [key: string]: KeyRecord }> {
    const jsonstr = await this.#storage.get(configs.STORAGE_KEYS.KEY_INFO);
    if (!jsonstr) return {};
    return jsonstr;
  }

  async getKeysArray(): Promise<KeyRecord[]> {
    return Object.values(await this.getKeysObject());
  }

  isLocked(): boolean {
    return this.#_isLocked;
  }

  lock(): void {
    clearTimeout(this.#_autoLock);
    this.#_mnemonic = null;
    this.#_isLocked = true;
  }
}

export default KeyRing;
