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
    "0xed96b2e3e21e021f3b3e0b39b93585705dbbc53a9cf940365f2ea61f71bdd8a68a3272bfc6e79d5f5b89cc32d85a9aba01ce04173038ede70c8d8da8f7cb4506";

  const txMsg =
    '{"payload":{"exec":{"code":"(coin.transfer-create \\"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291\\" \\"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291\\" (read-keyset \\"ks\\") 0.000000000000)","data":{"ks":{"keys":["e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291"],"pred":"keys-all"}}}},"nonce":"kjs:nonce:1696630965601","signers":[{"pubKey":"e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","scheme":"ED25519","clist":[{"name":"coin.TRANSFER","args":["k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291",{"decimal":"0"}]},{"name":"coin.GAS","args":[]}]}],"meta":{"gasLimit":2500,"gasPrice":1e-8,"sender":"k:e84affbb41a62d74020bc4841ea206aba7734f9e0d30fb688a4a84fe2d30e291","ttl":28800,"creationTime":1696630965,"chainId":"1"},"networkId":"testnet04"}';

  const txMsgSig =
    "0x8ee1c3cd94602b96a8ee59488c7ee7b0ff464b169513bd42872423219fa291c093bd791f62a11dd7aa00dfd3fa8e4b613e364ea9e4de4afe3d84ce3556673102";
  it("it should sign correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/1");

    // Act
    const signResult = await kadenaSigner.sign(msgHash, keypair);

    // Assert
    expect(signResult).equals(signature);
  });

  it("it should sign tx msgs correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/0");
    const txMsgHash = bufferToHex(blake2AsU8a(txMsg));
    // Act
    const signResult = await kadenaSigner.sign(txMsgHash, keypair);
    // Assert
    expect(signResult).equals(txMsgSig);
  });

  it("it should verify correctly", async () => {
    // Arrange
    const kadenaSigner = new Signer();
    const keypair = await kadenaSigner.generate(MNEMONIC, "m/44'/626'/0'/1");

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
