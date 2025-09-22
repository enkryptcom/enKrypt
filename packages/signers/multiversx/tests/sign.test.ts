import { bufferToHex } from "@enkryptcom/utils";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { describe, expect, it } from "vitest";
import { MultiversXSigner } from "../src";

describe("test sign and verify", () => {
  const MNEMONIC = {
    mnemonic:
      "matter trumpet twenty parade fame north lift sail valve salon foster cinnamon",
  };

  it("should sign and verify signature", async () => {
    const signer = new MultiversXSigner();

    const keypair = await signer.generate(MNEMONIC, "m/44'/508'/0'/0'/0'");
    const msg = "this is a test message";
    const msgHash = bufferToHex(blake2AsU8a(msg));

    const signature = await signer.sign(msgHash, keypair);
    const verifyResult = await signer.verify(
      msgHash,
      signature,
      keypair.publicKey,
    );

    expect(verifyResult).toBe(true);
  });
});
