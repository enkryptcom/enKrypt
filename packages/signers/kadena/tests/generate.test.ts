import { describe, it, expect } from "vitest";
import Signer from "../src";

describe("Kadena address generate", () => {
  const MNEMONIC =
    "vault grant math damage slight live equip turtle taxi prize phrase notice";

  it("should generate Kadena addresses correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();

    // Act & Assert
    let keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0");
    expect(keypair.address).equals(
      "0x8910d3f54c8dff9fce85da39a4e2c194ffc73dd4182e47d0ddbf9883d6aaff06"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/1");
    expect(keypair.address).equals(
      "0x3beae80c42b00b2847e27f3c35da801c728d5f22fb31647c2271c50c80179077"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/2");
    expect(keypair.address).equals(
      "0x9a5881272654d58195b7e09c4630c7ec4081065dade87d6f7c394bf0858cd306"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/3");
    expect(keypair.address).equals(
      "0x94e167fd2fd2dc741fa0ce820a7c57857786dd60505f28de6a15dfe73934b5e9"
    );
  });
});
