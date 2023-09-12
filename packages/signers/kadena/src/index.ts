import { SignerInterface, KeyPair } from "@enkryptcom/types";

// eslint-disable-next-line import/extensions
import kadenaCrypto from "cardano-crypto-kadena.js/kadena-crypto.js";

class Signer implements SignerInterface {
  async generate(mnemonic: string, derivationPath = ""): Promise<KeyPair> {
    const root = kadenaCrypto.kadenaMnemonicToRootKeypair("", mnemonic.trim());
    const hardIndex = 0x80000000 + Number(derivationPath);
    const privPubKey = kadenaCrypto.kadenaGenKeypair("", root, hardIndex);

    return {
      address: this.bufferToHex(privPubKey[1]),
      privateKey: this.bufferToHex(privPubKey[0]),
      publicKey: this.bufferToHex(privPubKey[1]),
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string
  ): Promise<boolean> {
    console.log(msgHash, sig, publicKey);
    return true;
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    console.log(msgHash, keyPair);
    return "";
  }

  bufferToHex(buffer: Iterable<number>): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

export default Signer;
