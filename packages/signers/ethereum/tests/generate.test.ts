import { expect } from "chai";
import Signer from "../src";

describe("Ethreum address generate", () => {
  const MNEMONIC =
    "awake book subject inch gentle blur grant damage process float month clown";
  it("should generate ethereum addresses correctly", async () => {
    const ethreumSigner = new Signer();
    let keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/0/0");
    expect(keypair.address).equals(
      "0x4dcccf58c6573eb896250b0c9647a40c1673af44"
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/0/1");
    expect(keypair.address).equals(
      "0xf4a950dac2cf3a8101e375550eeb79a53b74335c"
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/1");
    expect(keypair.address).equals(
      "0xd49dfba8172c8230baaf3797aba628fa6e28275a"
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/200625'/0'/0/0");
    expect(keypair.address).equals(
      "0xa2d4f37035a61641ec4c8b46efee2363ed3fef20"
    );
  });
});
