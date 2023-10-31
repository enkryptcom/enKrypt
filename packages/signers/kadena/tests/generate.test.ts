import { expect } from "chai";
import Signer from "../src";

describe("Kadena address generate", () => {
  const MNEMONIC =
    "favorite service senior cluster chicken shift square endorse casual kidney doll exhibit";

  it.only("should generate Kadena addresses correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();

    // Act & Assert
    let keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0");
    expect(keypair.address).equals(
      "0x40a9305bd53a921c44cf19dc9bac4e5d73465fc6a46343ab313defe6b0bfb0a3"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/1");
    expect(keypair.address).equals(
      "0xea14c16c053a5543b831e73f55086e4fccb8cc7be764cd74d362179a1d588416"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/2");
    expect(keypair.address).equals(
      "0xaf2a1ff42a9e652d1a8ed1f4f3c7bffcb36a9788c632a53544d7aff07d2a1678"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/3");
    expect(keypair.address).equals(
      "0xaeb2b28c7cddfa5fd8963acd9df13a858d8329590537e5495b1d5dbc3eeadd92"
    );
  });
});
