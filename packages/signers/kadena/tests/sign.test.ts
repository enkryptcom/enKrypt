import { describe, it, expect } from "vitest";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { bufferToHex } from "@enkryptcom/utils";
import { KadenaSigner } from "../src";

describe("Kadena signing", () => {
  const MNEMONIC = {
    mnemonic:
      "vault grant math damage slight live equip turtle taxi prize phrase notice",
  };

  const msg =
    "Everything should be made as simple as possible, but not simpler.";
  const msgHash = bufferToHex(blake2AsU8a(msg));
  const signature =
    "0xf69eef958ac52c7775680c920b10f6c2d28c927369e26c8c66f580565cfbd0a53748fb310a574567cc936a2dafd9531278a3d96febb2046392738fe37f1bc10e";

  const txMsg =
    '{"payload":{"exec":{"code":"(coin.transfer-create \\"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291\\" \\"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291\\" (read-keyset \\"ks\\") 0.000000000000)","data":{"ks":{"keys":["e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291"],"pred":"keys-all"}}}},"nonce":"kjs:nonce:1696630965601","signers":[{"pubKey":"e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","scheme":"ED25519","clist":[{"name":"coin.TRANSFER","args":["k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291",{"decimal":"0"}]},{"name":"coin.GAS","args":[]}]}],"meta":{"gasLimit":2500,"gasPrice":1e-8,"sender":"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","ttl":28800,"creationTime":1696630965,"chainId":"1"},"networkId":"testnet04"}';

  const txMsgSig =
    "0x91a2c04d766f9fdd7150b55608686c6d227a4c411467c140be0833803845060f6f6b18b71378f33ae96029cf8b8a90d9b7244ff14c60e4c4e7c8f88214946f07";
  it("it should sign correctly", async () => {
    // Arrange
    const kadenaSigner = new KadenaSigner();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0");

    // Act
    const signResult = await kadenaSigner.sign(msgHash, keypair);

    // Assert
    expect(signResult).equals(signature);
  });

  it("it should sign tx msgs correctly", async () => {
    // Arrange
    const kadenaSigner = new KadenaSigner();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0");
    const txMsgHash = bufferToHex(blake2AsU8a(txMsg));
    // Act
    const signResult = await kadenaSigner.sign(txMsgHash, keypair);
    // Assert
    expect(signResult).equals(txMsgSig);
  });

  it("it should verify correctly", async () => {
    // Arrange
    const kadenaSigner = new KadenaSigner();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0");

    // Act
    const verifyResult = await kadenaSigner.verify(
      msgHash,
      signature,
      keypair.publicKey,
    );

    // Assert
    expect(verifyResult).equals(true);
  });
});
