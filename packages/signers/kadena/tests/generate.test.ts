import { expect } from "chai";
import Signer from "../src";

describe("Kadena address generate", () => {
  const MNEMONIC =
    "favorite service senior cluster chicken shift square endorse casual kidney doll exhibit";

  it.only("should generate Kadena addresses correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();

    // Act & Assert
    let keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0");
    expect(keypair.address).equals(
      "0x7a3931f9379b5b63c76d73e3d79efbc890f56cfb22f1505ad457b7d0fb025f6d"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0/0");
    expect(keypair.address).equals(
      "0x46e43dc208df46dfcc0662777f23dd8853079e3e0e8e2a31abc816cfbf55ea55"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0/1");
    expect(keypair.address).equals(
      "0x07a9263d75d8debb5dcaebf679d09d1291111ebdc4eaaee73992dc0401e10e04"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0/2");
    expect(keypair.address).equals(
      "0xc1937f9eca305cdd048ad5785aaf1ad168b04d565250f6cd6e550c6d957e00b3"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0/3");
    expect(keypair.address).equals(
      "0x0d7f186afcd0759cd509de3741d609d3465aa65d74d0393410ad4a137252295d"
    );
  });
});
