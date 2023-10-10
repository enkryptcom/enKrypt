import { SignerInterface, KeyPair } from "@enkryptcom/types";
import { mnemonicToSeedSync } from "bip39";
import { sign as tweetSign } from "tweetnacl";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { derivePath } from "./libs/ed25519";

class Signer implements SignerInterface {
  async generate(mnemonic: string, derivationPath = ""): Promise<KeyPair> {
    const seed = bufferToHex(mnemonicToSeedSync(mnemonic), true);
    const dPathSegments = derivationPath.split("/");
    const indexVal = Number(dPathSegments.pop());
    const keys = derivePath(
      dPathSegments.join("/"),
      seed,
      0x80000000 + indexVal
    );
    const keyPair = tweetSign.keyPair.fromSeed(keys.key);
    return {
      address: bufferToHex(keyPair.publicKey),
      privateKey: bufferToHex(keyPair.secretKey),
      publicKey: bufferToHex(keyPair.publicKey),
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string
  ): Promise<boolean> {
    return tweetSign.detached.verify(
      hexToBuffer(msgHash),
      hexToBuffer(sig),
      hexToBuffer(publicKey)
    );
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const sig = tweetSign.detached(
      hexToBuffer(msgHash),
      hexToBuffer(keyPair.privateKey)
    );
    return bufferToHex(sig);
  }
}

export default Signer;
