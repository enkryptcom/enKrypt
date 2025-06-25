import { describe, expect, it } from "vitest";
import { MultiversXSigner } from "../src";

describe("test user wallets", () => {
  const MNEMONIC = {
    mnemonic:
      "matter trumpet twenty parade fame north lift sail valve salon foster cinnamon",
  };

  it("should generate user wallets", async () => {
    const signer = new MultiversXSigner();

    let keypair = await signer.generate(MNEMONIC, "m/44'/508'/0'/0'/0'");
    expect(keypair.address).equals(
      "erd1l8g9dk3gz035gkjhwegsjkqzdu3augrwhcfxrnucnyyrpc2220pqg4g7na",
    );

    keypair = await signer.generate(MNEMONIC, "m/44'/508'/0'/0'/1'");
    expect(keypair.address).equals(
      "erd1fmhwg84rldg0xzngf53m0y607wvefvamh07n2mkypedx27lcqnts4zs09p",
    );

    keypair = await signer.generate(MNEMONIC, "m/44'/508'/0'/0'/2'");
    expect(keypair.address).equals(
      "erd1tyuyemt4xz2yjvc7rxxp8kyfmk2n3h8gv3aavzd9ru4v2vhrkcksptewtj",
    );
  });
});
