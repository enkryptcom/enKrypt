import { expect } from "chai";
import Signer from "../src";

describe("Ethreum address generate", () => {
  const MNEMONIC =
    "awake book subject inch gentle blur grant damage process float month clown";
  it("should generate bicoin addresses correctly", async () => {
    const bitcoinSigner = new Signer();
    let keypair = await bitcoinSigner.generate(MNEMONIC, "m/44'/0'/0'/0/0");
    expect(keypair.address).equals(
      "0x03472412900c9f4ce53b0aa251e269979ba4f28912d8029b7556cb8397b14db45a"
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/44'/0'/0'/0/1");
    expect(keypair.address).equals(
      "0x0344fc4582db2073485156fd17a58f933bebabfc6ba67d0b1ed656acbfdd1e0ee9"
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/49'/0'/0'/0/3");
    expect(keypair.address).equals(
      "0x02a2f83bc8a62a71679b957806901fbea35edb936165ebfd5184305d2d17a74d25"
    );
    keypair = await bitcoinSigner.generate(MNEMONIC, "m/49'/0'/0'/0/12");
    expect(keypair.address).equals(
      "0x035f9ee3234dc049f65825073db81af3f9a120d8b2d86602d405ac60c7f406a8e4"
    );
  });
});
