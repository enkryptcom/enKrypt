import { expect } from "chai";
import Signer from "../src";

describe("Kadena address generate", () => {
  const MNEMONIC =
    "favorite service senior cluster chicken shift square endorse casual kidney doll exhibit";

  it("should generate Kadena addresses correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();

    // Act & Assert
    let keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0'/0");
    expect(keypair.address).equals(
      "0x40a9305bd53a921c44cf19dc9bac4e5d73465fc6a46343ab313defe6b0bfb0a3"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0'/1");
    expect(keypair.address).equals(
      "0x50d824cb62578b1fcf8e4afb122e98884d5f04070950b93a102e1ba1e1f3d1bb"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0'/2");
    expect(keypair.address).equals(
      "0x287b9cdbd0894fbff67c664b4cc1e7da9eca9b03ef94fd5baa2cfabe2cd3c6a5"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0'/3");
    expect(keypair.address).equals(
      "0xe00a31c57aabe95554ad71c700c723153c0dd67b072b569916209138e419c122"
    );
  });
});
