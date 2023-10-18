// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from "chai";
import { KeyRecordAdd, SignerType, WalletType } from "@enkryptcom/types";
import { MemoryStorage } from "@enkryptcom/utils";
import Storage from "@enkryptcom/storage";
import KeyRing from "../src";

describe("Keyring create tests", () => {
  const password = "helloworld";
  const MNEMONIC =
    "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
  // eslint-disable-next-line prefer-arrow-callback,func-names
  it("keyring should generate ed25519kda keys", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage);
    await keyring.init(password, { mnemonic: MNEMONIC });
    const keyAdd: KeyRecordAdd = {
      basePath: "m/44'/626'/0'/0'/0'",
      signerType: SignerType.ed25519kda,
      name: "0index",
      walletType: WalletType.mnemonic,
    };
    await keyring.unlockMnemonic(password);
    const pair = await keyring.createKey(keyAdd);
    expect(pair.signerType).equals(SignerType.ed25519kda);
    expect(pair.pathIndex).equals(0);
    expect(pair.address).equals(
      "0x7359492db65e4e6487134cd68d5620e011965ce50c84f38e613c7bdb47c2bfa3"
    );
    keyring.lock();
  }).timeout(20000);
  it("keyring should generate secp256k1btc keys", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage);
    await keyring.init(password, { mnemonic: MNEMONIC });
    const keyAdd: KeyRecordAdd = {
      basePath: "m/49'/0'/0'/0",
      signerType: SignerType.secp256k1btc,
      name: "0index",
      walletType: WalletType.mnemonic,
    };
    await keyring.unlockMnemonic(password);
    const pair = await keyring.createKey(keyAdd);
    expect(pair.signerType).equals(SignerType.secp256k1btc);
    expect(pair.pathIndex).equals(0);
    expect(pair.address).equals(
      "0x03a8b8b68bec95d27f8a8d78712717bd18f605d95fa64f2b05d2325f873b457c82"
    );
    keyring.lock();
  }).timeout(20000);
  it("keyring should generate sr25519 keys", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage);
    await keyring.init(password, { mnemonic: MNEMONIC });
    const keyAdd: KeyRecordAdd = {
      basePath: "//",
      signerType: SignerType.sr25519,
      name: "0index",
      walletType: WalletType.mnemonic,
    };
    await keyring.unlockMnemonic(password);
    const pair = await keyring.createKey(keyAdd);
    expect(pair.signerType).equals(SignerType.sr25519);
    expect(pair.pathIndex).equals(0);
    expect(pair.address).equals(
      "5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV"
    );
    keyring.lock();
  }).timeout(20000);
  it("keyring should generate ecdsa keys", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage);
    await keyring.init(password, { mnemonic: MNEMONIC });
    const keyAdd: KeyRecordAdd = {
      basePath: "//",
      signerType: SignerType.ecdsa,
      name: "0index",
      walletType: WalletType.mnemonic,
    };
    await keyring.unlockMnemonic(password);
    const pair = await keyring.createKey(keyAdd);
    expect(pair.signerType).equals(SignerType.ecdsa);
    expect(pair.pathIndex).equals(0);
    expect(pair.address).equals(
      "5GKyBtzbxKU1qjhZrKpMiwtJj7o6jJcXbKQVtYq74DCPerXN"
    );
  }).timeout(20000);
  it("keyring should generate ed25519 keys", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage);
    await keyring.init(password, { mnemonic: MNEMONIC });
    const keyAdd: KeyRecordAdd = {
      basePath: "//",
      signerType: SignerType.ed25519,
      name: "0index",
      walletType: WalletType.mnemonic,
    };
    await keyring.unlockMnemonic(password);
    const pair = await keyring.createKey(keyAdd);
    expect(pair.signerType).equals(SignerType.ed25519);
    expect(pair.pathIndex).equals(0);
    expect(pair.address).equals(
      "5DFJF7tY4bpbpcKPJcBTQaKuCDEPCpiz8TRjpmLeTtweqmXL"
    );
  }).timeout(20000);
  it("keyring should generate ethereum keys", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage);
    await keyring.init(password, { mnemonic: MNEMONIC });
    const keyAdd: KeyRecordAdd = {
      basePath: "m/44'/60'/0'/0",
      signerType: SignerType.secp256k1,
      walletType: WalletType.mnemonic,
      name: "0index",
    };
    await keyring.unlockMnemonic(password);
    const pair = await keyring.createAndSaveKey(keyAdd);
    expect(pair.signerType).equals(SignerType.secp256k1);
    expect(pair.pathIndex).equals(0);
    expect(pair.address).equals("0xf24ff3a9cf04c71dbc94d0b566f7a27b94566cac");
    await keyring.renameAccount(pair.address, "this is a new name");
    const newNameAccount = (await keyring.getKeysObject())[pair.address];
    expect(newNameAccount.name).equals("this is a new name");
    const tryToDelete = await keyring
      .deleteAccount(pair.address)
      .then(() => true)
      .catch(() => false);
    expect(tryToDelete).equals(false);
  }).timeout(20000);

  it("keyring should delete non mnemonic wallets", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage);
    await keyring.init(password, { mnemonic: MNEMONIC });
    const keyAdd: KeyRecordAdd = {
      basePath: "m/44'/60'/0'/0",
      signerType: SignerType.secp256k1,
      walletType: WalletType.ledger,
      name: "hw-wallet",
    };
    await keyring.unlockMnemonic(password);
    const pair = await keyring.createAndSaveKey(keyAdd);
    const tryToDelete = await keyring
      .deleteAccount(pair.address)
      .then(() => true)
      .catch(() => false);
    expect(tryToDelete).equals(true);
    const deletedAccount = (await keyring.getKeysObject())[pair.address];
    expect(deletedAccount).equals(undefined);
  }).timeout(20000);
});
