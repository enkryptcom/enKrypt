import { expect } from "chai";
import Signer from "../src";

describe("Kadena address generate", () => {
  // You can check this derived address on:
  // https://kadenakeys.io

  const MNEMONIC =
    "clip coffee brain token leader kiss around main finger network avoid west";

  it("should generate Kadena addresses correctly", async () => {
    const kadenaSigner = new Signer();

    let keypair = await kadenaSigner.generate(MNEMONIC, "0");
    expect(keypair.address).equals(
      "57b9e48323d8cf9d811a4032662ab86c1c8f440b974759b4267d27a1f1ca936f"
    );

    keypair = await kadenaSigner.generate(MNEMONIC, "1");
    expect(keypair.address).equals(
      "3c77941d21857bd26683154a5efc5c15169f27698fc56906bcf49b4c05e1006b"
    );

    keypair = await kadenaSigner.generate(MNEMONIC, "2");
    expect(keypair.address).equals(
      "f8dc5d97bc43155b033f813833bcda9ef374b060689648b4c0226f5a1456935a"
    );

    keypair = await kadenaSigner.generate(MNEMONIC, "3");
    expect(keypair.address).equals(
      "df3125da8789dc114be0c953040333e9a1a9afb31e1170ade42be52a6701842e"
    );
  });
});
