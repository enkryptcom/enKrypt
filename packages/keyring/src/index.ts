import {
  Errors,
  SignerInterface,
  SignerType,
  SignOptions,
  EnkryptAccount,
  KeyRecordAdd,
  HWWalletAdd,
  HWwalletType,
  KeyPairAdd,
  WalletType,
  KeyPair,
  MnemonicWithExtraWord,
} from "@enkryptcom/types";
import { Storage } from "@enkryptcom/storage";
import { entropyToMnemonic, generateMnemonic, mnemonicToEntropy } from "bip39";
import { hexToBuffer, encrypt, decrypt, utf8ToHex } from "@enkryptcom/utils";
import { PolkadotSigner } from "@enkryptcom/signer-polkadot";
import { EthereumSigner } from "@enkryptcom/signer-ethereum";
import { BitcoinSigner } from "@enkryptcom/signer-bitcoin";
import { KadenaSigner } from "@enkryptcom/signer-kadena";
import assert from "assert";
import configs from "./configs";
import { pathParser } from "./utils";

class KeyRing {
  #storage: Storage;

  #isLocked: boolean;

  #signers: { [key in SignerType]: SignerInterface };

  #mnemonic: MnemonicWithExtraWord;

  #privkeys: Record<string, string>;

  #autoLock: ReturnType<typeof setTimeout>;

  readonly autoLockTime: number;

  constructor(storage: Storage, locktime = 30 * 60 * 1000) {
    this.#storage = storage;
    this.#isLocked = true;
    this.autoLockTime = locktime;
    this.#privkeys = {};
    this.#signers = {
      [SignerType.secp256k1]: new EthereumSigner(),
      [SignerType.ecdsa]: new PolkadotSigner(SignerType.ecdsa),
      [SignerType.ed25519]: new PolkadotSigner(SignerType.ed25519),
      [SignerType.sr25519]: new PolkadotSigner(SignerType.sr25519),
      [SignerType.secp256k1btc]: new BitcoinSigner(),
      [SignerType.ed25519kda]: new KadenaSigner(),
      [SignerType.ed25519sol]: new KadenaSigner(),
    };
  }

  async init(
    password: string,
    {
      strength = configs.MNEMONIC_STRENGTH,
      mnemonic = generateMnemonic(strength),
      extraWord = undefined,
    }: { strength?: number; mnemonic?: string; extraWord?: string } = {},
  ): Promise<void> {
    assert(
      !(await this.#storage.get(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC)),
      Errors.KeyringErrors.MnemonicExists,
    );
    assert(
      !(await this.#storage.get(configs.STORAGE_KEYS.ENCRYPTED_EXTRA_WORD)),
      Errors.KeyringErrors.ExtrawordExists,
    );
    assert(password, Errors.KeyringErrors.NoPassword);
    const entropy = hexToBuffer(mnemonicToEntropy(mnemonic));
    const encrypted = await encrypt(entropy, password);
    await this.#storage.set(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC, encrypted);
    if (extraWord) {
      const encryptedExtraword = await encrypt(
        hexToBuffer(utf8ToHex(extraWord)),
        password,
      );
      await this.#storage.set(
        configs.STORAGE_KEYS.ENCRYPTED_EXTRA_WORD,
        encryptedExtraword,
      );
    }
  }

  async isInitialized(): Promise<boolean> {
    if (await this.#storage.get(configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC))
      return true;
    return false;
  }

  #resetTimeout(): void {
    clearTimeout(this.#autoLock);
    this.#autoLock = setTimeout(() => {
      this.#mnemonic = null;
      this.#isLocked = true;
      this.#privkeys = {};
    }, this.autoLockTime);
  }

  async #getPathIndex(basePath: string): Promise<number> {
    const pathIndexes =
      (await this.#storage.get(configs.STORAGE_KEYS.PATH_INDEXES)) || {};
    if (pathIndexes[basePath] === undefined) return 0;
    return pathIndexes[basePath] + 1;
  }

  async #getMnemonic(password: string): Promise<MnemonicWithExtraWord> {
    const encrypted = await this.#storage.get(
      configs.STORAGE_KEYS.ENCRYPTED_MNEMONIC,
    );
    assert(encrypted, Errors.KeyringErrors.NotInitialized);
    const decryptedEntropy = await decrypt(encrypted, password);
    const encryptedExtraWord = await this.#storage.get(
      configs.STORAGE_KEYS.ENCRYPTED_EXTRA_WORD,
    );
    const decryptedMnemonic = entropyToMnemonic(decryptedEntropy);
    if (encryptedExtraWord) {
      const decryptedExtraWord = await decrypt(encryptedExtraWord, password);
      return {
        mnemonic: decryptedMnemonic,
        extraWord: decryptedExtraWord.toString("utf8"),
      };
    }
    return {
      mnemonic: decryptedMnemonic,
    };
  }

  async unlockMnemonic(password: string): Promise<void> {
    await Promise.all([
      this.#getMnemonic(password),
      this.#getPrivateKeys(password),
    ]).then((results) => {
      [this.#mnemonic, this.#privkeys] = results;
      this.#isLocked = false;
      if (this.autoLockTime !== 0) {
        this.#resetTimeout();
      }
    });
  }

  async getMnemonic(password: string): Promise<MnemonicWithExtraWord> {
    return this.#getMnemonic(password);
  }

  async createKey(key: KeyRecordAdd): Promise<EnkryptAccount> {
    assert(!this.#isLocked, Errors.KeyringErrors.Locked);
    this.#resetTimeout();
    const nextIndex = await this.#getPathIndex(key.basePath);
    let keypair: KeyPair;
    if (key.walletType === WalletType.privkey) {
      keypair = {
        privateKey: "", // we will manually set these
        publicKey: "",
        address: "",
      };
    } else {
      keypair = await this.#signers[key.signerType].generate(
        this.#mnemonic,
        pathParser(key.basePath, nextIndex, key.signerType),
      );
    }
    return {
      address: keypair.address,
      basePath: key.basePath,
      name: key.name,
      pathIndex: nextIndex,
      publicKey: keypair.publicKey,
      signerType: key.signerType,
      walletType: key.walletType,
      isHardware: false,
    };
  }

  async createAndSaveKey(key: KeyRecordAdd): Promise<EnkryptAccount> {
    const keyRecord = await this.createKey(key);
    await this.#saveKeyRecord(keyRecord);
    return keyRecord;
  }

  async #saveKeyRecord(keyRecord: EnkryptAccount): Promise<void> {
    const existingKeys = await this.getKeysObject();
    assert(
      !existingKeys[keyRecord.address],
      Errors.KeyringErrors.AddressExists,
    );
    existingKeys[keyRecord.address] = keyRecord;
    await this.#storage.set(configs.STORAGE_KEYS.KEY_INFO, existingKeys);
    const pathIndexes =
      (await this.#storage.get(configs.STORAGE_KEYS.PATH_INDEXES)) || {};
    pathIndexes[keyRecord.basePath] = keyRecord.pathIndex;
    await this.#storage.set(configs.STORAGE_KEYS.PATH_INDEXES, pathIndexes);
  }

  async sign(msgHash: string, options: SignOptions): Promise<string> {
    assert(!this.#isLocked, Errors.KeyringErrors.Locked);
    this.#resetTimeout();
    assert(
      !Object.values(HWwalletType).includes(
        options.walletType as unknown as HWwalletType,
      ),
      Errors.KeyringErrors.CannotUseKeyring,
    );
    let keypair: KeyPair;
    if (options.walletType === WalletType.privkey) {
      const pubKey = (await this.getKeysArray()).find(
        (i) =>
          i.basePath === options.basePath && i.pathIndex === options.pathIndex,
      ).publicKey;
      keypair = {
        privateKey: this.#privkeys[options.pathIndex.toString()],
        publicKey: pubKey,
      };
    } else {
      keypair = await this.#signers[options.signerType].generate(
        this.#mnemonic,
        pathParser(options.basePath, options.pathIndex, options.signerType),
      );
    }
    return this.#signers[options.signerType].sign(msgHash, keypair);
  }

  async getEthereumEncryptionPublicKey(options: SignOptions): Promise<string> {
    assert(!this.#isLocked, Errors.KeyringErrors.Locked);
    this.#resetTimeout();
    assert(
      !Object.values(HWwalletType).includes(
        options.walletType as unknown as HWwalletType,
      ),
      Errors.KeyringErrors.CannotUseKeyring,
    );
    assert(
      options.signerType === SignerType.secp256k1,
      Errors.KeyringErrors.EnckryptDecryptNotSupported,
    );
    const keypair = await this.#signers[options.signerType].generate(
      this.#mnemonic,
      pathParser(options.basePath, options.pathIndex, options.signerType),
    );
    return (
      this.#signers[options.signerType] as EthereumSigner
    ).getEncryptionPublicKey(keypair);
  }

  async ethereumDecrypt(
    encryptedMessage: string,
    options: SignOptions,
  ): Promise<string> {
    assert(!this.#isLocked, Errors.KeyringErrors.Locked);
    this.#resetTimeout();
    assert(
      !Object.values(HWwalletType).includes(
        options.walletType as unknown as HWwalletType,
      ),
      Errors.KeyringErrors.CannotUseKeyring,
    );
    assert(
      options.signerType === SignerType.secp256k1,
      Errors.KeyringErrors.EnckryptDecryptNotSupported,
    );
    const keypair = await this.#signers[options.signerType].generate(
      this.#mnemonic,
      pathParser(options.basePath, options.pathIndex, options.signerType),
    );
    return (this.#signers[options.signerType] as EthereumSigner).decrypt(
      encryptedMessage,
      keypair,
    );
  }

  async getKeysObject(): Promise<{ [key: string]: EnkryptAccount }> {
    const jsonstr = await this.#storage.get(configs.STORAGE_KEYS.KEY_INFO);
    if (!jsonstr) return {};
    return jsonstr;
  }

  async getKeysArray(): Promise<EnkryptAccount[]> {
    return Object.values(await this.getKeysObject());
  }

  async addHWAccount(account: HWWalletAdd): Promise<EnkryptAccount> {
    const existingKeys = await this.getKeysObject();
    assert(!existingKeys[account.address], Errors.KeyringErrors.AddressExists);
    const hwAcc: EnkryptAccount = { isHardware: true, ...account };
    existingKeys[account.address] = hwAcc;
    await this.#storage.set(configs.STORAGE_KEYS.KEY_INFO, existingKeys);
    return hwAcc;
  }

  async renameAccount(
    address: string,
    newName: string,
  ): Promise<EnkryptAccount> {
    const existingKeys = await this.getKeysObject();
    assert(existingKeys[address], Errors.KeyringErrors.AddressDoesntExists);
    const account = existingKeys[address];
    account.name = newName;
    existingKeys[address] = account;
    await this.#storage.set(configs.STORAGE_KEYS.KEY_INFO, existingKeys);
    return account;
  }

  async deleteAccount(address: string): Promise<void> {
    const existingKeys = await this.getKeysObject();
    assert(existingKeys[address], Errors.KeyringErrors.AddressDoesntExists);
    assert(
      existingKeys[address].walletType !== WalletType.mnemonic,
      Errors.KeyringErrors.CantRemoveMnemonicAddress,
    );
    delete existingKeys[address];
    await this.#storage.set(configs.STORAGE_KEYS.KEY_INFO, existingKeys);
  }

  async #getPrivateKeys(
    keyringPassword: string,
  ): Promise<Record<string, string>> {
    const encrypted = await this.#storage.get(
      configs.STORAGE_KEYS.ENCRYPTED_PRIVKEYS,
    );
    if (!encrypted) return {};
    const decrypted = await decrypt(encrypted, keyringPassword);
    return JSON.parse(decrypted.toString("utf-8"));
  }

  async #setPrivateKey(
    pathIndex: string,
    privKey: string,
    keyringPassword: string,
  ): Promise<void> {
    const allKeys = await this.#getPrivateKeys(keyringPassword);
    assert(!allKeys[pathIndex], Errors.KeyringErrors.AddressExists);
    allKeys[pathIndex] = privKey;
    const encrypted = await encrypt(
      Buffer.from(JSON.stringify(allKeys), "utf-8"),
      keyringPassword,
    );
    await this.#storage.set(configs.STORAGE_KEYS.ENCRYPTED_PRIVKEYS, encrypted);
    this.#privkeys = allKeys;
  }

  async addKeyPair(
    keyPair: KeyPairAdd,
    keyringPassword: string,
  ): Promise<EnkryptAccount> {
    const existingKeys = await this.getKeysObject();
    assert(!existingKeys[keyPair.address], Errors.KeyringErrors.AddressExists);
    const kpAcc = await this.createKey({
      basePath: configs.PRIVEY_BASE_PATH,
      name: keyPair.name,
      signerType: keyPair.signerType,
      walletType: WalletType.privkey,
    });
    kpAcc.address = keyPair.address;
    kpAcc.publicKey = keyPair.publicKey;
    await this.#setPrivateKey(
      kpAcc.pathIndex.toString(),
      keyPair.privateKey,
      keyringPassword,
    );
    await this.#saveKeyRecord(kpAcc);
    return kpAcc;
  }

  async reset(): Promise<void> {
    this.lock();
    const resetPromises = Object.values(configs.STORAGE_KEYS).map((name) =>
      this.#storage.remove(name),
    );
    await Promise.all(resetPromises);
  }

  isLocked(): boolean {
    return this.#isLocked;
  }

  lock(): void {
    clearTimeout(this.#autoLock);
    this.#mnemonic = null;
    this.#privkeys = {};
    this.#isLocked = true;
  }
}

export default KeyRing;
