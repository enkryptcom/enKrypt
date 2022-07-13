// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from "chai";
import { MemoryStorage, keccak256 } from "@enkryptcom/utils";
import Storage from "@enkryptcom/storage";
import { SignerType, WalletType } from "@enkryptcom/types";
import { u8aWrapBytes, u8aToHex, stringToU8a } from "@polkadot/util";
import KeyRing from "../src";

describe("Keyring signing test", () => {
  const password = "helloworld";
  const MNEMONIC =
    "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
  const MNEMONIC2 =
    "else number fox shop mouse crush fire daughter portion hamster similar escape";
  // eslint-disable-next-line prefer-arrow-callback,func-names
  it("keyring should sign ethereum messages", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage, 30000);
    await keyring.init(password, { mnemonic: MNEMONIC });
    expect(keyring.isLocked()).to.be.equals(true);
    await keyring.unlockMnemonic(password);
    const keyRecord = await keyring.createKey({
      name: "abc",
      basePath: "m/44'/60'/0'/0",
      signerType: SignerType.secp256k1,
      walletType: WalletType.mnemonic,
    });
    expect(keyRecord.address).to.be.equal(
      "0xf24ff3a9cf04c71dbc94d0b566f7a27b94566cac"
    );
    const keyRecord2 = await keyring.addKeyPair(
      {
        address: "0x7763488dceb716cb2d8656e65c5846a4b9df1b5d",
        name: "test",
        privateKey:
          "0x9777ca05af8d998bc9e36b4ca3d98a4ec816671df645dc970124f5df265ff003",
        publicKey:
          "0x03330102972e476d0a0c8004d7329641760ac01ab695058b2134ada99737f89b97",
        signerType: SignerType.secp256k1,
      },
      password
    );
    expect(keyRecord2.address).to.be.equal(
      "0x7763488dceb716cb2d8656e65c5846a4b9df1b5d"
    );
    const message = "abcd";
    const msgToSign = keccak256(
      `\x19Ethereum Signed Message:\n${message.length}${message}`
    );
    keccak256(`\x19Ethereum Signed Message:\n${message.length}${message}`);

    const sig = await keyring.sign(msgToSign, keyRecord);
    expect(sig).to.be.equal(
      `0xc0cd7923162bbcf6065ca563f69eb44503ac67e9edb9870f8651ff926c9a007c5d26b90e29819915df9cda30e974722edf69c6d1f69a02b76716b74db57767d71b`
    );

    const sig2 = await keyring.sign(msgToSign, keyRecord2);
    expect(sig2).to.be.equal(
      `0x85242cbd5c409001f7c3412b2c0e21e0207ae83547d28abca32324a4ea2cff892bb38d060d51cea045abd7391ffef9eb1fab8b2d50f949a6c1904c6b9e0da2cb1b`
    );
  }).timeout(10000);
  it("keyring should sign substrate messages", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage, 30000);
    await keyring.init(password, { mnemonic: MNEMONIC2 });
    expect(keyring.isLocked()).to.be.equals(true);
    await keyring.unlockMnemonic(password);
    const keyRecord = await keyring.createKey({
      name: "abc",
      basePath: "//",
      signerType: SignerType.ed25519,
      walletType: WalletType.mnemonic,
    });
    expect(keyRecord.address).to.be.equal(
      "5GfqwuBBRBSioJY1UYSheSQfcVdX8V4CoBmFpu1JTNRqnUkk"
    );
    const message = "abcd";
    const sig = await keyring.sign(
      u8aToHex(u8aWrapBytes(stringToU8a(message))),
      keyRecord
    );
    expect(sig).to.be.equal(
      `0x55fef6ded518726c589c1eb524f9a6d53e5853e3f94e1d425d018424373604d2769800c174adc6d4ee75b09f4037037495438cbcfed4c77dfbdeeef7d38e0707`
    );
  }).timeout(10000);

  it("keyring should sign raw keypairs", async () => {
    const memStorage = new MemoryStorage();
    const storage = new Storage("keyring", { storage: memStorage });
    const keyring = new KeyRing(storage, 30000);
    await keyring.init(password);
    expect(keyring.isLocked()).to.be.equals(true);
    await keyring.unlockMnemonic(password);
    const keyRecord = await keyring.addKeyPair(
      {
        address: "0x7763488dceb716cb2d8656e65c5846a4b9df1b5d",
        name: "test",
        privateKey:
          "0x9777ca05af8d998bc9e36b4ca3d98a4ec816671df645dc970124f5df265ff003",
        publicKey:
          "0x03330102972e476d0a0c8004d7329641760ac01ab695058b2134ada99737f89b97",
        signerType: SignerType.secp256k1,
      },
      password
    );
    expect(keyRecord.address).to.be.equal(
      "0x7763488dceb716cb2d8656e65c5846a4b9df1b5d"
    );
    const keyRecord2 = await keyring.addKeyPair(
      {
        address: "0x3777583a1E946863FeAB8826B4c0ebb0a7D14c1B",
        name: "test2",
        privateKey:
          "0xefe791a36a8b138850831e8aa31b862ad284450f2bbd13d17a8e21a3dec4adbf",
        publicKey:
          "0x03ed026faba30429c9c0bd1968e413ee92ad4784bedc48851f3b1bbaae0585f749",
        signerType: SignerType.secp256k1,
      },
      password
    );
    expect(keyRecord2.address).to.be.equal(
      "0x3777583a1E946863FeAB8826B4c0ebb0a7D14c1B"
    );
    const message = "abcd";
    const msgToSign = keccak256(
      `\x19Ethereum Signed Message:\n${message.length}${message}`
    );
    keccak256(`\x19Ethereum Signed Message:\n${message.length}${message}`);

    const sig = await keyring.sign(msgToSign, keyRecord);
    expect(sig).to.be.equal(
      `0x85242cbd5c409001f7c3412b2c0e21e0207ae83547d28abca32324a4ea2cff892bb38d060d51cea045abd7391ffef9eb1fab8b2d50f949a6c1904c6b9e0da2cb1b`
    );
    const sig2 = await keyring.sign(msgToSign, keyRecord2);
    expect(sig2).to.be.equal(
      `0xd84d309ef3f850325ff1758e3a25b9f5eb458101a42c876c8f072a4c429c46417e83711dcfca20fb09a83f54454c8d88bad70456c06f89622ba8cdd90910ae0b1b`
    );
  }).timeout(10000);
});
