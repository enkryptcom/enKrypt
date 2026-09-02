import { describe, it, expect } from "vitest";
import { Errors } from "@enkryptcom/types";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { getPublicKey } from "@noble/secp256k1";
import { BitcoinSigner } from "../src";
import fixtures from "./fixtures";

describe("Bitcoin signing", () => {
  it("it should sign correctly", { timeout: 20_000 }, async () => {
    const ethreumSigner = new BitcoinSigner();
    const promises = fixtures.valid.map((f) => {
      const ecpair = {
        publicKey: bufferToHex(getPublicKey(hexToBuffer(f.d))),
        privateKey: `0x${f.d}`,
      };
      return ethreumSigner.sign(f.m, ecpair).then((sig) => {
        expect(sig).equals(
          bufferToHex(
            Buffer.concat([
              hexToBuffer(f.signature),
              Buffer.from([f.recoveryId]),
            ]),
          ),
        );
      });
    });
    await Promise.all(promises);
  });
});

describe("Bitcoin signing verification", () => {
  const MSG_HASH =
    "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
  const PRIVATE_KEY =
    "0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";

  it(
    "it should reject a signature that does not verify",
    { timeout: 20_000 },
    async () => {
      const bitcoinSigner = new BitcoinSigner();
      const unrelatedPublicKey = bufferToHex(
        getPublicKey(hexToBuffer(`0x${"11".repeat(32)}`)),
      );
      await expect(
        bitcoinSigner.sign(MSG_HASH, {
          publicKey: unrelatedPublicKey,
          privateKey: PRIVATE_KEY,
        }),
      ).rejects.toThrow(Errors.SigningErrors.UnableToVerify);
    },
  );

  it(
    "it should keep signing when the key pair matches",
    { timeout: 20_000 },
    async () => {
      const bitcoinSigner = new BitcoinSigner();
      const publicKey = bufferToHex(getPublicKey(hexToBuffer(PRIVATE_KEY)));
      const signature = await bitcoinSigner.sign(MSG_HASH, {
        publicKey,
        privateKey: PRIVATE_KEY,
      });
      expect(signature.length).equals(132);
    },
  );
});
