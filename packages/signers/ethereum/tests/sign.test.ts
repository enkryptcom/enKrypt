import { describe, it, expect } from "vitest";
import { Errors } from "@enkryptcom/types";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { privateToPublic } from "@ethereumjs/util";
import { EthereumSigner } from "../src";

describe("Ethreum signing", () => {
  const echash =
    "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
  const ecprivkey =
    "3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
  const ecpair = {
    publicKey: bufferToHex(privateToPublic(hexToBuffer(ecprivkey))),
    privateKey: ecprivkey,
  };
  it("it should sign correctly", async () => {
    const ethreumSigner = new EthereumSigner();
    const signature = await ethreumSigner.sign(echash, ecpair);
    expect(signature).equals(
      "0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca661b",
    );
  });
});

describe("Ethreum signing verification", () => {
  const echash =
    "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
  const ecprivkey =
    "3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";

  it("it should verify against a compressed public key", async () => {
    const ethreumSigner = new EthereumSigner();
    const compressedPublicKey =
      "0x03330102972e476d0a0c8004d7329641760ac01ab695058b2134ada99737f89b97";
    const privateKey =
      "0x9777ca05af8d998bc9e36b4ca3d98a4ec816671df645dc970124f5df265ff003";
    const signature = await ethreumSigner.sign(echash, {
      publicKey: compressedPublicKey,
      privateKey,
    });
    expect(await ethreumSigner.verify(echash, signature, compressedPublicKey))
      .to.be.true;
  });

  it("it should reject a signature that does not verify", async () => {
    const ethreumSigner = new EthereumSigner();
    const unrelatedPublicKey = bufferToHex(
      privateToPublic(hexToBuffer(`0x${"11".repeat(32)}`)),
    );
    await expect(
      ethreumSigner.sign(echash, {
        publicKey: unrelatedPublicKey,
        privateKey: ecprivkey,
      }),
    ).rejects.toThrow(Errors.SigningErrors.UnableToVerify);
  });
});
