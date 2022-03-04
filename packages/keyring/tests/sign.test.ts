// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from "chai";
import { MemoryStorage, keccak256 } from "@enkryptcom/utils";
import Storage from "@enkryptcom/storage";
import { SignerType } from "@enkryptcom/types";
import KeyRing from "../src";

describe("Keyring signing test", () => {
  const memStorage = new MemoryStorage();
  const storage = new Storage("keyring", { storage: memStorage });
  const keyring = new KeyRing(storage, 30000);
  const password = "helloworld";
  const MNEMONIC =
    "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
  // eslint-disable-next-line prefer-arrow-callback,func-names
  it("keyring should sign messages", async () => {
    await keyring.init(password, { mnemonic: MNEMONIC });
    expect(keyring.isLocked()).to.be.equals(true);
    await keyring.unlockMnemonic(password);
    const keyRecord = await keyring.createKey({
      name: "abc",
      basePath: "m/44'/60'/0'/0",
      type: SignerType.secp256k1,
    });
    expect(keyRecord.address).to.be.equal(
      "0xf24ff3a9cf04c71dbc94d0b566f7a27b94566cac"
    );
    const message = "abcd";
    const sig = await keyring.sign(
      keccak256(`\x19Ethereum Signed Message:\n${message.length}${message}`),
      keyRecord
    );
    expect(sig).to.be.equal(
      `0xc0cd7923162bbcf6065ca563f69eb44503ac67e9edb9870f8651ff926c9a007c5d26b90e29819915df9cda30e974722edf69c6d1f69a02b76716b74db57767d71b`
    );
  }).timeout(5000);
});
