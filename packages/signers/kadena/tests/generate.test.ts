import { describe, it, expect } from "vitest";
import { KadenaSigner } from "../src";

describe("Kadena address generate", () => {
  const MNEMONIC = {
    mnemonic:
      "vault grant math damage slight live equip turtle taxi prize phrase notice",
  };

  it("should generate Kadena addresses correctly", async () => {
    // Arrange
    const kadenaSigner = new KadenaSigner();

    // Act & Assert
    let keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0");
    expect(keypair.address).equals(
      "0x8910d3f54c8dff9fce85da39a4e2c194ffc73dd4182e47d0ddbf9883d6aaff06",
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/1");
    expect(keypair.address).equals(
      "0x3beae80c42b00b2847e27f3c35da801c728d5f22fb31647c2271c50c80179077",
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/2");
    expect(keypair.address).equals(
      "0x9a5881272654d58195b7e09c4630c7ec4081065dade87d6f7c394bf0858cd306",
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/3");
    expect(keypair.address).equals(
      "0x94e167fd2fd2dc741fa0ce820a7c57857786dd60505f28de6a15dfe73934b5e9",
    );
  });
});

describe("Kadena address generate with extraword", () => {
  const MNEMONIC = {
    mnemonic:
      "maximum hurt want daring rail alley ripple attract winter stay math piano",
    extraWord: "i am enkrypt",
  };

  it("should generate Kadena addresses correctly", async () => {
    // Arrange
    const kadenaSigner = new KadenaSigner();

    // Act & Assert
    let keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0");
    expect(keypair.address).equals(
      "0xfd9bf70924dac158dfe4d572544469232d32c2f54ed2f68f110fdabfc11d1d10",
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/1");
    expect(keypair.address).equals(
      "0x0820d2d63e04143c12d78f180179beed851cbfd62c5bedb1d976755fac164a14",
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/2");
    expect(keypair.address).equals(
      "0x141050fa2269ee278a3743568c1419129cc219af90eb63f635d6c8f60495e98c",
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/3");
    expect(keypair.address).equals(
      "0xd7b598a6994f883eab13e264033b5c12475887be5c7527d5cd4b735a17097123",
    );
  });
});
