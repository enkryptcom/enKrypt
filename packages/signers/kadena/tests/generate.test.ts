import { expect } from "chai";
import Signer from "../src";

describe("Kadena address generate", () => {
  const MNEMONIC =
    "clip coffee brain token leader kiss around main finger network avoid west";

  it("should generate Kadena addresses correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();

    // Act & Assert
    let keypair = await kadenaSigner.generate(MNEMONIC, "0");
    expect(keypair.address).equals(
      "e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "1");
    expect(keypair.address).equals(
      "2ddd388820dfd8ddafa37a69926e0b5e57d29daa3adab2ede8a390f984038283"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "2");
    expect(keypair.address).equals(
      "16dcf13ed0261406c63561ef32853e4b417fe1c197a164b6385718c596261918"
    );

    // Act & Assert
    keypair = await kadenaSigner.generate(MNEMONIC, "3");
    expect(keypair.address).equals(
      "af29ee6f585381b0109eef8ba51f55fbe9cca31c83375efdb8d72588be3995fc"
    );
  });
});
