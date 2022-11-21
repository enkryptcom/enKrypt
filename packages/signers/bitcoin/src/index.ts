import { mnemonicToSeed } from "bip39";
import { Errors, SignerInterface, KeyPair } from "@enkryptcom/types";
import { hexToBuffer, bufferToHex } from "@enkryptcom/utils";
import { getPublicKey, verify, sign } from "@noble/secp256k1";
import HDkey from "hdkey";

class Signer implements SignerInterface {
  async generate(mnemonic: string, derivationPath = ""): Promise<KeyPair> {
    const seed = await mnemonicToSeed(mnemonic);
    const hdkey = HDkey.fromMasterSeed(seed);
    const key = hdkey.derive(derivationPath);
    return {
      address: bufferToHex(getPublicKey(key.privateKey, true)),
      privateKey: bufferToHex(key.privateKey),
      publicKey: bufferToHex(getPublicKey(key.privateKey)),
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string
  ): Promise<boolean> {
    return verify(
      hexToBuffer(sig),
      hexToBuffer(msgHash),
      hexToBuffer(publicKey)
    );
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const msgHashBuffer = hexToBuffer(msgHash);
    const privateKeyBuffer = hexToBuffer(keyPair.privateKey);
    const rsig = await sign(msgHashBuffer, privateKeyBuffer, {
      der: false,
      recovered: true,
    });
    const signature = Buffer.concat([rsig[0], Buffer.from([rsig[1]])]);
    if (
      !this.verify(
        bufferToHex(msgHashBuffer),
        bufferToHex(signature),
        keyPair.publicKey
      )
    ) {
      throw new Error(Errors.SigningErrors.UnableToVerify);
    }
    return bufferToHex(signature);
  }
}
export default Signer;
