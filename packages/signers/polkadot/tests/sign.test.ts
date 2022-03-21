/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { expect } from "chai";
import { SignerType } from "@enkryptcom/types";
import Signer from "../src";

describe("Polkadot signers", () => {
  // the tests container

  const MNEMONIC =
    "error fish boy absent drop next ice keep meadow little air include";
  const MSG_HASH =
    "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
  it("ecdsa signer should work", async () => {
    const signer = new Signer(SignerType.ecdsa);
    for (const bool of [true, false]) {
      const keypair = await signer.generate(MNEMONIC, "", { onlyJS: bool });
      const signature = await signer.sign(MSG_HASH, keypair, { onlyJS: bool });
      expect(signature).equals(
        "0x44d27f74c8f35bf816f701e1081a12359235d99f22a95fac2b6f9614ecf06cfe11d1dc62c0ef85545953b51b48dc9b0786f70d9e0fdd97439055ec2bda1b703d00"
      );
    }
  });
  it("sr25519 signer should work", async () => {
    const signer = new Signer(SignerType.sr25519);
    for (const bool of [true, false]) {
      const keypair = await signer.generate(MNEMONIC, "", { onlyJS: bool });
      const signature = await signer.sign(MSG_HASH, keypair, { onlyJS: bool });
      expect(keypair.address).equals(
        "5E4Vd2pQCSLLWxHhXVSH1Kc9TQdpAXdjLfWtSKgsY3A9AXM4"
      );
      expect(signature.length).equals(130);
    }
  });
  it("ed25519 signer should work", async () => {
    const signer = new Signer(SignerType.ed25519);
    for (const bool of [true, false]) {
      const keypair = await signer.generate(MNEMONIC, "", { onlyJS: bool });
      const signature = await signer.sign(MSG_HASH, keypair, { onlyJS: bool });
      expect(signature).equals(
        "0x35aacb42a86c330228515ddc6ea286c10feae2d7cf60ca7c4949663ee95159e5e3ec4a9597fc643d90711ef01e0f712610e93bce3388c175d71baf363bc7f002"
      );
    }
  });
});
