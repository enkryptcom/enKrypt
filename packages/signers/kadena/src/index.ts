import { SignerInterface, KeyPair } from "@enkryptcom/types";
import kadenaCrypto from "cardano-crypto-kadena.js/kadena-crypto";

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
    const xpub = this.hexToBuffer(publicKey);
    const xsig = this.hexToBuffer(sig);

    return kadenaCrypto.kadenaVerify(msgHash, xpub, xsig);
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const xprv = this.hexToBuffer(keyPair.privateKey);

    return this.bufferToHex(kadenaCrypto.kadenaSign("", msgHash, xprv));
  }

  bufferToHex(buffer: Iterable<number>): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  hexToBuffer(hex: string): Uint8Array {
    return new Uint8Array(
      hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16))
    );
  }
}

export default Signer;
