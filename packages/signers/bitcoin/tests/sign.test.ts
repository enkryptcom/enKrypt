import { describe, it, expect } from "vitest";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { getPublicKey } from "@noble/secp256k1";
import { BitcoinSigner } from "../src";
import fixtures from "./fixtures";

describe("Ethreum signing", () => {
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
