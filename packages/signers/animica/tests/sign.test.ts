import { describe, it, expect } from "vitest";
import { sha3_256 } from "@noble/hashes/sha3.js";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { AnimicaSigner, keyPairFromSeed } from "../src";

describe("Animica signing", () => {
  // BIP-39 reference mnemonic, no passphrase. Vectors from
  // https://github.com/animicaorg/all/blob/main/docs/wallet/HD_DERIVATION.md
  const MNEMONIC = {
    mnemonic:
      "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
  };
  const VECTORS = [
    {
      path: "m/44'/4279885'/0'/0'/0'",
      xi: "0xe3bb5b745b1da91201e7b9744038def07dfd02da9a85682d30468b9355c50835",
      pkSha3:
        "3a548b5244ff391410a31007f6bf9797322f5ee902e1ae6751ab275b231aa6d2",
      address:
        "anim1zqpn54yt2fz07wg5zz33qplkh7tewv30tm5s9cdwvag6kf6myvd2d5sj9pzp7",
    },
    {
      path: "m/44'/4279885'/0'/0'/1'",
      xi: "0x5b7ea6e7ab17f7f78900e57dae759104518bca0e55f7fa69b6d0b9986e130595",
      pkSha3:
        "b14edc8b5a825feaf35e189e40f00924426cea44d385d7579196ceef33cb0565",
      address:
        "anim1zqpmznku3ddgyhl27d0p38jq7qyjgsnvafzd8pwh27gednh0x09s2egxyv9ej",
    },
    {
      path: "m/44'/4279885'/1'/0'/0'",
      xi: "0xcf68ab2eb4222e81656973cc01769ab28b794f8907e214c1f615a5da6a5c0260",
      pkSha3:
        "354ab1c033b08136ce8626393a4d68a299c3c9901c38e84b4ed41fa8de00ed00",
      address:
        "anim1zqpn2j43cqempqfke6rzvwf6f4529xwrexgpcw8gfd8dg8agmcqw6qqu83f7t",
    },
  ];

  // 64-byte sign-hash (SHA3-512 of the domain-separated sign bytes) from the
  // Animica wallet-integration spec test vector; seed = 0x00..01.
  const SPEC_SEED = hexToBuffer(
    "0000000000000000000000000000000000000000000000000000000000000001",
  );
  const SPEC_ADDRESS =
    "anim1zqpay9pht55sfmasy38z5qrtycn3hedsrpdkka26hskhepsq7uzgrhq5h2mq9";
  const msgHash =
    "0xe3a0ed598d7c9278f5588f9683cefb5b79fc5e93ee20ff411b97d32b4d770f64cc9893a853828e3e35213548e6b3576b8b4fd3c9a933ec69a590d0ef226b9d08";

  it("should derive the documented HD vectors", async () => {
    const signer = new AnimicaSigner();
    for (const vector of VECTORS) {
      const keypair = await signer.generate(MNEMONIC, vector.path);
      expect(keypair.privateKey).toBe(vector.xi);
      expect(hexToBuffer(keypair.publicKey).length).toBe(1952);
      expect(bufferToHex(sha3_256(hexToBuffer(keypair.publicKey)), true)).toBe(
        vector.pkSha3,
      );
      expect(keypair.address).toBe(vector.address);
    }
  });

  it("should reject non-hardened paths", async () => {
    const signer = new AnimicaSigner();
    await expect(
      signer.generate(MNEMONIC, "m/44'/4279885'/0'/0'/0"),
    ).rejects.toThrow(/hardened/);
  });

  it("should generate the spec keypair from a raw seed", () => {
    const keypair = keyPairFromSeed(SPEC_SEED);
    expect(keypair.address).toBe(SPEC_ADDRESS);
    expect(
      keypair.publicKey.startsWith("0xce7b20d71819f7d47aa544210f9cedbd"),
    ).toBe(true);
  });

  it("should sign and verify correctly", async () => {
    const signer = new AnimicaSigner();
    const keypair = keyPairFromSeed(SPEC_SEED);
    const signature = await signer.sign(msgHash, keypair);
    expect(hexToBuffer(signature).length).toBe(3309);
    const isValid = await signer.verify(msgHash, signature, keypair.publicKey);
    expect(isValid).toBe(true);
  });

  it("should reject invalid signatures", async () => {
    const signer = new AnimicaSigner();
    const keypair = keyPairFromSeed(SPEC_SEED);
    const signature = hexToBuffer(await signer.sign(msgHash, keypair));
    signature[100] ^= 0x01;
    expect(
      await signer.verify(msgHash, bufferToHex(signature), keypair.publicKey),
    ).toBe(false);
    expect(
      await signer.verify(msgHash, "0x" + "0".repeat(6618), keypair.publicKey),
    ).toBe(false);
  });

  it("should not verify under a different key", async () => {
    const signer = new AnimicaSigner();
    const keypair = keyPairFromSeed(SPEC_SEED);
    const other = await signer.generate(MNEMONIC, VECTORS[0].path);
    const signature = await signer.sign(msgHash, keypair);
    expect(await signer.verify(msgHash, signature, other.publicKey)).toBe(
      false,
    );
  });
});
