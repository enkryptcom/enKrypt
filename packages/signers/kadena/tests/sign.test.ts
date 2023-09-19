import { expect } from "chai";
import { blake2b } from "cardano-crypto-kadena.js/features/crypto-primitives";

import Signer from "../src";

function bufferToHex(buffer: Iterable<number>): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("Kadena signing", () => {
  const MNEMONIC =
    "clip coffee brain token leader kiss around main finger network avoid west";
  
  const msg = "Everything should be made as simple as possible, but not simpler.";
  const signature = "894531b2e628884f960b3b58369bf9d34401fc5bb54cc4eac0bf577df3701bc0cf5f330a5db06cbf3980384f2a5894ae3eb64f7c83d63fa31205817a489c5509";

  it("it should sign correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "1");
    const msgHash = bufferToHex(blake2b(Buffer.from(msg), 32));

    // Act
    const signResult = await kadenaSigner.sign(msgHash, keypair);

    // Assert
    expect(signResult).equals(signature);
  });

  it.only("it should verify correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "1");
    const msgHash = bufferToHex(blake2b(Buffer.from(msg), 32));

    // Act
    const signResult = await kadenaSigner.verify(msgHash, signature, keypair.publicKey);

    // Assert
    expect(signResult).equals(true);
  });
});
