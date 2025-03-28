import { describe, it, expect } from "vitest";
import { BitcoinSigner } from "../src";

describe("bitcoin address generate", () => {
  const MNEMONIC = {
    mnemonic:
      "awake book subject inch gentle blur grant damage process float month clown",
  };
  it("should generate bicoin addresses correctly", async () => {
    const bitcoinSigner = new BitcoinSigner();
    let keypair = await bitcoinSigner.generate(MNEMONIC, "m/44'/0'/0'/0/0");
    expect(keypair.address).equals(
      "0x03472412900c9f4ce53b0aa251e269979ba4f28912d8029b7556cb8397b14db45a",
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/44'/0'/0'/0/1");
    expect(keypair.address).equals(
      "0x0344fc4582db2073485156fd17a58f933bebabfc6ba67d0b1ed656acbfdd1e0ee9",
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/49'/0'/0'/0/3");
    expect(keypair.address).equals(
      "0x02a2f83bc8a62a71679b957806901fbea35edb936165ebfd5184305d2d17a74d25",
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/49'/0'/0'/0/12");
    expect(keypair.address).equals(
      "0x035f9ee3234dc049f65825073db81af3f9a120d8b2d86602d405ac60c7f406a8e4",
    );
  });
});

describe("bitcoin address generate with extra word", () => {
  const MNEMONIC = {
    mnemonic:
      "raw jazz fabric electric polar degree benefit blame hover depth tag inform",
    extraWord: "i am enkrypt",
  };
  it("should generate bicoin addresses correctly", async () => {
    const bitcoinSigner = new BitcoinSigner();
    let keypair = await bitcoinSigner.generate(MNEMONIC, "m/44'/0'/0'/0/0");
    expect(keypair.address).equals(
      "0x039eb88d40a7f61ce9bcd1c138e355ffd8b80c2dde481ca4b8a4d5a1fc0553aabd",
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/44'/0'/0'/0/1");
    expect(keypair.address).equals(
      "0x0397faebd9ed166dd914a354e00590a0f7cbd767976652b4083d363c71c22d1a73",
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/49'/0'/0'/0/3");
    expect(keypair.address).equals(
      "0x020c50a401dcce82a666c1ced1e4f3b1c5effa8cf1cf1897c09a35efe380a1a20b",
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/49'/0'/0'/0/12");
    expect(keypair.address).equals(
      "0x03b79b368bf68db03b7820059e1525b47dc86b182c2d1b9cc4c32000f1f5a17cdb",
    );
  });
});
