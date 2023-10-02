import { expect } from "chai";
import Signer from "../src";

describe("Kadena signing", () => {
  const MNEMONIC =
    "clip coffee brain token leader kiss around main finger network avoid west";
  
  const msg = "Everything should be made as simple as possible, but not simpler.";
  const msgHash = "5GQQ6eK9yrL2JoZfZgob7bL1UJaGPToW1zbRkoxUMMQ";
  const signature = "ed96b2e3e21e021f3b3e0b39b93585705dbbc53a9cf940365f2ea61f71bdd8a68a3272bfc6e79d5f5b89cc32d85a9aba01ce04173038ede70c8d8da8f7cb4506";

  it("it should sign correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "1");

    // Act
    const signResult = await kadenaSigner.sign(msg, keypair);

    // Assert
    expect(signResult).equals(signature);
  });

  it("it should verify correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "1");

    // Act
    const verifyResult = await kadenaSigner.verify(msgHash, signature, keypair.publicKey);

    // Assert
    expect(verifyResult).equals(true);
  });
});
