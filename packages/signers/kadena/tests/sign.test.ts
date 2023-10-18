import { expect } from "chai";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { bufferToHex } from "@enkryptcom/utils";
import Signer from "../src";

describe("Kadena signing", () => {
  const MNEMONIC =
    "clip coffee brain token leader kiss around main finger network avoid west";

  const msg =
    "Everything should be made as simple as possible, but not simpler.";
  const msgHash = bufferToHex(blake2AsU8a(msg));
  const signature =
    "0x8fd01eccc203d17cbffe54393954c213fb087dd6e62cf3c50bc5635346a83d9fae80c214ecb20bab092a0eca10408223e6e1007f597a3d4bfb525d68a0573a05";

  const txMsg =
    '{"payload":{"exec":{"code":"(coin.transfer-create \\"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291\\" \\"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291\\" (read-keyset \\"ks\\") 0.000000000000)","data":{"ks":{"keys":["e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291"],"pred":"keys-all"}}}},"nonce":"kjs:nonce:1696630965601","signers":[{"pubKey":"e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","scheme":"ED25519","clist":[{"name":"coin.TRANSFER","args":["k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291",{"decimal":"0"}]},{"name":"coin.GAS","args":[]}]}],"meta":{"gasLimit":2500,"gasPrice":1e-8,"sender":"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","ttl":28800,"creationTime":1696630965,"chainId":"1"},"networkId":"testnet04"}';

  const txMsgSig =
    "0xe929eecf16d77016646a95448fd24de3183488a5e4ab7ae0b1fcb5971fd6e3a524a6cc2879b2369e40f827b816355dbaad09b173442742c39ba487c68199a302";
  it("it should sign correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0'/1");

    // Act
    const signResult = await kadenaSigner.sign(msgHash, keypair);

    // Assert
    expect(signResult).equals(signature);
  });

  it("it should sign tx msgs correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0'/0");
    const txMsgHash = bufferToHex(blake2AsU8a(txMsg));
    // Act
    const signResult = await kadenaSigner.sign(txMsgHash, keypair);
    // Assert
    expect(signResult).equals(txMsgSig);
  });

  it("it should verify correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0'/1");

    // Act
    const verifyResult = await kadenaSigner.verify(
      msgHash,
      signature,
      keypair.publicKey
    );

    // Assert
    expect(verifyResult).equals(true);
  });
});
