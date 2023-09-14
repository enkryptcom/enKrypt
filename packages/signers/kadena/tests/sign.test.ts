import { expect } from "chai";
import { blake2b } from "cardano-crypto-kadena.js/features/crypto-primitives";
import { hash } from "@kadena/cryptography-utils";

import Signer from "../src";

function bufferToHex(buffer: Iterable<number>): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("Kadena signing", () => {
  const MNEMONIC =
    "clip coffee brain token leader kiss around main finger network avoid west";
  
  // const msg = "Everything should be made as simple as possible, but not simpler.";
  const msg = "{\"signers\":[{\"pubKey\":\"57b9e48323d8cf9d811a4032662ab86c1c8f440b974759b4267d27a1f1ca936f\",\"clist\":[{\"name\":\"coin.TRANSFER\",\"args\":[\"57b9e48323d8cf9d811a4032662ab86c1c8f440b974759b4267d27a1f1ca936f\",\"gjpeixer\",1.0e-3]},{\"name\":\"coin.GAS\",\"args\":[]}]}],\"meta\":{\"creationTime\":1694695327,\"ttl\":28800,\"chainId\":\"1\",\"gasPrice\":1.0e-6,\"gasLimit\":2320,\"sender\":\"57b9e48323d8cf9d811a4032662ab86c1c8f440b974759b4267d27a1f1ca936f\"},\"nonce\":\"chainweaver\",\"networkId\":\"testnet04\",\"payload\":{\"exec\":{\"code\":\"(coin.transfer \\\"57b9e48323d8cf9d811a4032662ab86c1c8f440b974759b4267d27a1f1ca936f\\\" \\\"gjpeixer\\\" 0.001)\",\"data\":null}}}";
  const signature = "9c911a113d6acb8847501ab005a7e2d674cfe3eed9df80eaba12645eccf8a54ffbaa58657fd45ce01fe47b5795aaca53c85fb503db1036aa01440e5cd6c26b06";

  it("it should sign correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "0");
    const msgHash = hash(msg);

    // Act
    const signResult = await kadenaSigner.sign(msgHash, keypair);

    // Assert
    expect(signResult).equals(signature);
  });

  it("it should verify correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "0");
    const msgHash = hash(msg);

    // Act
    const verifyResult = await kadenaSigner.verify(msgHash, signature, keypair.publicKey);

    // Assert
    expect(verifyResult).equals(true);
  });
});
