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
  const signature = "5ca1f34b074c8cffbd2127facdde210158cc48885cf3637aa0cb6c6809741ae8631cecec601c804ad8764761380fff02d3ab329f33b23d09f611a2ca8736e306";

  it("it should sign correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "0");
    const msgHash = bufferToHex(blake2b(Buffer.from(msg), 32));

    // Act
    const signResult = await kadenaSigner.sign(msgHash, keypair);

    // Assert
    expect(signResult).equals(signature);
  });

  it("it should verify correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "0");
    const msgHash = bufferToHex(blake2b(Buffer.from(msg), 32));

    // Act
    const signResult = await kadenaSigner.verify(msgHash, signature, keypair.publicKey);

    // Assert
    expect(signResult).equals(true);
  });
});
