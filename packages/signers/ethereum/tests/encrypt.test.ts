import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { expect } from "chai";
import { privateToPublic } from "ethereumjs-util";
import Signer from "../src";

// https://github.com/MetaMask/eth-sig-util/blob/main/src/encryption.test.ts
describe("Ethreum encrypt", () => {
  const ecprivkey =
    "0x7e5374ec2ef0d91761a6e72fdf8f6ac665519bfdf6da0a2329cf0d804514b816";
  const encryptionPublicKey = "C5YMNdqE4kLgxQhJO1MfuQcHP5hjVSXzamzd/TxlR0U=";
  const ecpair = {
    publicKey: bufferToHex(privateToPublic(hexToBuffer(ecprivkey))),
    privateKey: ecprivkey,
  };
  const encryptedData = {
    version: "x25519-xsalsa20-poly1305",
    nonce: "1dvWO7uOnBnO7iNDJ9kO9pTasLuKNlej",
    ephemPublicKey: "FBH1/pAEHOOW14Lu3FWkgV3qOEcuL78Zy+qW1RwzMXQ=",
    ciphertext: "f8kBcl/NCyf3sybfbwAKk/np2Bzt9lRVkZejr6uh5FgnNlH/ic62DZzy",
  };
  const secretMessage = "My name is Satoshi Buterin";
  it("it should return correct encryption pubkey", async () => {
    const ethereumSigner = new Signer();
    const pubkey = await ethereumSigner.getEncryptionPublicKey(ecpair);
    expect(pubkey).equals(encryptionPublicKey);
  });
  it("it should decrypt", async () => {
    const ethereumSigner = new Signer();
    const encryptedMessage = bufferToHex(
      Buffer.from(JSON.stringify(encryptedData), "utf8")
    );
    const decrypted = await ethereumSigner.decrypt(encryptedMessage, ecpair);
    expect(decrypted).equals(secretMessage);
  });
});
