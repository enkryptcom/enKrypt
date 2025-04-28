import { describe, it, expect } from "vitest";
import { KeyRecordAdd, SignerType, WalletType } from "@enkryptcom/types";
import { MemoryStorage } from "@enkryptcom/utils";
import { Storage } from "@enkryptcom/storage";
import KeyRing from "../src";

describe("Keyring create tests", () => {
  const password = "helloworld";
  const MNEMONIC =
    "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
  const EXTRA_WORD = "i am enkrypt";
  // eslint-disable-next-line prefer-arrow-callback,func-names
  it(
    "keyring should generate ed25519kda keys",
    { timeout: 20_000 },
    async () => {
      const memStorage = new MemoryStorage();
      const storage = new Storage("keyring", { storage: memStorage });
      const keyring = new KeyRing(storage);
      await keyring.init(password, { mnemonic: MNEMONIC });
      const keyAdd: KeyRecordAdd = {
        basePath: "m/44'/626'/0'",
        signerType: SignerType.ed25519kda,
        name: "0index",
        walletType: WalletType.mnemonic,
      };
      await keyring.unlockMnemonic(password);
      const pair = await keyring.createKey(keyAdd);
      expect(pair.signerType).equals(SignerType.ed25519kda);
      expect(pair.pathIndex).equals(0);
      expect(pair.address).equals(
        "0xd75b971cc4846f543caa92e9bf07bf2f4cee87774f4ba8db2fde5c3dacaed03f",
      );
      keyring.lock();
    },
  );
  it(
    "keyring should generate ed25519kda keys with extra word",
    { timeout: 20_000 },
    async () => {
      const memStorage = new MemoryStorage();
      const storage = new Storage("keyring", { storage: memStorage });
      const keyring = new KeyRing(storage);
      await keyring.init(password, {
        mnemonic:
          "maximum hurt want daring rail alley ripple attract winter stay math piano",
        extraWord: "i am enkrypt",
      });
      const keyAdd: KeyRecordAdd = {
        basePath: "m/44'/626'/0'",
        signerType: SignerType.ed25519kda,
        name: "0index",
        walletType: WalletType.mnemonic,
      };
      await keyring.unlockMnemonic(password);
      const pair = await keyring.createKey(keyAdd);
      expect(pair.signerType).equals(SignerType.ed25519kda);
      expect(pair.pathIndex).equals(0);
      expect(pair.address).equals(
        "0x358c853c7e1c6adc8abcb845b66cb549f7c2d48c749f5a89a7269ccda7cf6f11",
      );
      keyring.lock();
    },
  );
  it(
    "keyring should generate secp256k1btc keys",
    { timeout: 20_000 },
    async () => {
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
        "0x03a8b8b68bec95d27f8a8d78712717bd18f605d95fa64f2b05d2325f873b457c82",
      );
      keyring.lock();
    },
  );
  it(
    "keyring should generate secp256k1btc keys with extra word",
    { timeout: 20_000 },
    async () => {
      const memStorage = new MemoryStorage();
      const storage = new Storage("keyring", { storage: memStorage });
      const keyring = new KeyRing(storage);
      await keyring.init(password, {
        mnemonic: MNEMONIC,
        extraWord: EXTRA_WORD,
      });
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
        "0x02fa7cae22d0bbc4a14757e8ae1a087bedc149ae07a0206ccc5d201879689e94f2",
      );
      keyring.lock();
    },
  );
  it(
    "keyring should generate sr25519 keys with extra word",
    { timeout: 20_000 },
    async () => {
      const memStorage = new MemoryStorage();
      const storage = new Storage("keyring", { storage: memStorage });
      const keyring = new KeyRing(storage);
      await keyring.init(password, {
        mnemonic: MNEMONIC,
        extraWord: EXTRA_WORD,
      });
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
        "5FWuCWBiKj1W6cfzkCopTWJdcWnjw1Sp2ngBniNafxupmowN",
      );
      keyring.lock();
    },
  );
  it("keyring should generate sr25519 keys", { timeout: 20_000 }, async () => {
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
      "5DfhGyQdFobKM8NsWvEeAKk5EQQgYe9AydgJ7rMB6E1EqRzV",
    );
    keyring.lock();
  });

  it("keyring should generate ecdsa keys", { timeout: 20_000 }, async () => {
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
      "5GKyBtzbxKU1qjhZrKpMiwtJj7o6jJcXbKQVtYq74DCPerXN",
    );
  });
  it(
    "keyring should generate ecdsa keys with extra word",
    { timeout: 20_000 },
    async () => {
      const memStorage = new MemoryStorage();
      const storage = new Storage("keyring", { storage: memStorage });
      const keyring = new KeyRing(storage);
      await keyring.init(password, {
        mnemonic: MNEMONIC,
        extraWord: EXTRA_WORD,
      });
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
        "5GCD3zEsDbsDboFa5ugPRy3PA6hgV1BSmudhaDxCFWvCEaQu",
      );
    },
  );
  it("keyring should generate ed25519 keys", { timeout: 20_000 }, async () => {
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
      "5DFJF7tY4bpbpcKPJcBTQaKuCDEPCpiz8TRjpmLeTtweqmXL",
    );
  });

  it(
    "keyring should generate ed25519 keys with extra word",
    { timeout: 20_000 },
    async () => {
      const memStorage = new MemoryStorage();
      const storage = new Storage("keyring", { storage: memStorage });
      const keyring = new KeyRing(storage);
      await keyring.init(password, {
        mnemonic: MNEMONIC,
        extraWord: EXTRA_WORD,
      });
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
        "5FhtBVo2UFV27q48q6GxPZDKecU4ff4xabaVdNwE76w6Zwpa",
      );
    },
  );

  it("keyring should generate ethereum keys", { timeout: 20_000 }, async () => {
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
  });

  it(
    "keyring should generate ethereum keys with extra word",
    { timeout: 20_000 },
    async () => {
      const memStorage = new MemoryStorage();
      const storage = new Storage("keyring", { storage: memStorage });
      const keyring = new KeyRing(storage);
      await keyring.init(password, {
        mnemonic: MNEMONIC,
        extraWord: EXTRA_WORD,
      });
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
      expect(pair.address).equals(
        "0x5000145785Dbf6d8a71c64FeB68Ee1715eC37221".toLowerCase(),
      );
      await keyring.renameAccount(pair.address, "this is a new name");
      const newNameAccount = (await keyring.getKeysObject())[pair.address];
      expect(newNameAccount.name).equals("this is a new name");
      const tryToDelete = await keyring
        .deleteAccount(pair.address)
        .then(() => true)
        .catch(() => false);
      expect(tryToDelete).equals(false);
    },
  );

  it(
    "keyring should delete non mnemonic wallets",
    { timeout: 20_000 },
    async () => {
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
    },
  );
});
