import { describe, it, expect } from "vitest";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { bufferToHex } from "@enkryptcom/utils";
import { MassaSigner } from "../src";

describe("Massa signing", () => {
  const MNEMONIC = {
    mnemonic:
      "error fish boy absent drop next ice keep meadow little air include",
  };

  const msg =
    "Everything should be made as simple as possible, but not simpler.";
  const msgHash = bufferToHex(blake2AsU8a(msg));

  it("should generate keypair correctly", async () => {
    const signer = new MassaSigner();
    const keypair = await signer.generate(MNEMONIC, "m/44'/632'/0'/0'");

    expect(keypair.address).toBeDefined();
    expect(keypair.privateKey).toBeDefined();
    expect(keypair.publicKey).toBeDefined();

    // Massa addresses should start with 'AU'
    expect(keypair.address?.startsWith("AU")).toBe(true);
  });

  it("should sign and verify correctly", async () => {
    const signer = new MassaSigner();
    const keypair = await signer.generate(MNEMONIC, "m/44'/632'/0'/0'");
    const signature = await signer.sign(msgHash, keypair);

    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);

    const isValid = await signer.verify(msgHash, signature, keypair.publicKey);
    expect(isValid).toBe(true);
  });

  it("should reject invalid signatures", async () => {
    const signer = new MassaSigner();
    const keypair = await signer.generate(MNEMONIC, "m/44'/632'/0'/0'");
    const invalidSignature = "0x" + "0".repeat(128); // Invalid signature
    const sig = await signer.sign(msgHash, keypair);
    console.log(sig);
    const isValid = await signer.verify(
      msgHash,
      invalidSignature,
      keypair.publicKey,
    );
    expect(isValid).toBe(false);
  });
  it("should accept invalid signatures", async () => {
    const signer = new MassaSigner();
    const keypair = await signer.generate(MNEMONIC, "m/44'/632'/0'/0'");
    const validSig =
      "1Twg6H8WCBMF3QqNr1dyCsgSA6uwxy4r5czVsaRcKvm9vM1gPoGaM36rEH4pz6fZmhoKfgEoqYb9CcUGxdT7Qq2ThJH4NK";
    const isValid = await signer.verify(msgHash, validSig, keypair.publicKey);
    expect(isValid).toBe(true);
  });
});
