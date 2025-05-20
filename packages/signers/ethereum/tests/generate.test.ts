import { describe, it, expect } from "vitest";
import { EthereumSigner } from "../src";

describe("Ethreum address generate", () => {
  const MNEMONIC = {
    mnemonic:
      "awake book subject inch gentle blur grant damage process float month clown",
  };
  it("should generate ethereum addresses correctly", async () => {
    const ethreumSigner = new EthereumSigner();
    let keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/0/0");
    expect(keypair.address).equals(
      "0x4dcccf58c6573eb896250b0c9647a40c1673af44",
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/0/1");
    expect(keypair.address).equals(
      "0xf4a950dac2cf3a8101e375550eeb79a53b74335c",
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/1");
    expect(keypair.address).equals(
      "0xd49dfba8172c8230baaf3797aba628fa6e28275a",
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/200625'/0'/0/0");
    expect(keypair.address).equals(
      "0xa2d4f37035a61641ec4c8b46efee2363ed3fef20",
    );
  });
});

describe("Ethreum address generate with extra word", () => {
  const MNEMONIC = {
    mnemonic:
      "lake unfair believe equip weather wolf soon seek wise mechanic dry exit",
    extraWord: "i am enkrypt",
  };
  it("should generate ethereum addresses correctly", async () => {
    const ethreumSigner = new EthereumSigner();
    let keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/0/0");
    expect(keypair.address).equals(
      "0xd7aaC5Ac417683a022F00A83769f59E97298581f".toLowerCase(),
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/0/1");
    expect(keypair.address).equals(
      "0xd1f4707e08628a3Bdf14af678D54751609eBf40D".toLowerCase(),
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/0'/0/19");
    expect(keypair.address).equals(
      "0xF3D041B68139A879468f8Ddc7c7007059f2620D1".toLowerCase(),
    );
    keypair = await ethreumSigner.generate(MNEMONIC, "m/44'/60'/200625'/0/10");
    expect(keypair.address).equals(
      "0x9c1e76141336482448445F7ca07c694b9F8ea89e".toLowerCase(),
    );
  });
});
