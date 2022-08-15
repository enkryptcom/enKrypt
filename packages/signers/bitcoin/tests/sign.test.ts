import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { getPublicKey } from "@noble/secp256k1";
import { expect } from "chai";
import Signer from "../src";
import fixtures from "./fixtures";

describe("Ethreum signing", () => {
  it("it should sign correctly", async () => {
    const ethreumSigner = new Signer();
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
            ])
          )
        );
      });
    });
    await Promise.all(promises);
  }).timeout(20000);
});
