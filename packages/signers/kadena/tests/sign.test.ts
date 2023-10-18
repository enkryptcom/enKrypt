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
    "0x5c23909b5b05854e79410777abd0ce3145c47defb5e7a32a887c617a28cb63c52ad22ecbc72dc87118eb7854fe3115fe1b47490364b2a240ce400cdc516ff70e";

  const txMsg =
    '{"payload":{"exec":{"code":"(coin.transfer-create \\"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291\\" \\"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291\\" (read-keyset \\"ks\\") 0.000000000000)","data":{"ks":{"keys":["e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291"],"pred":"keys-all"}}}},"nonce":"kjs:nonce:1696630965601","signers":[{"pubKey":"e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","scheme":"ED25519","clist":[{"name":"coin.TRANSFER","args":["k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291",{"decimal":"0"}]},{"name":"coin.GAS","args":[]}]}],"meta":{"gasLimit":2500,"gasPrice":1e-8,"sender":"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","ttl":28800,"creationTime":1696630965,"chainId":"1"},"networkId":"testnet04"}';

  const txMsgSig =
    "0xef8e48c609cd3f47852265785cc024900ee057eb766384292799f0cda38bf07839cff8aacd79581958f721098edb278ef92d112cdf1b623c69fde55b853af602";
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
