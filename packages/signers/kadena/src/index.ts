import { SignerInterface, KeyPair } from "@enkryptcom/types";
import {
  base64UrlDecodeArr,
  hexToBin,
  sign,
  verifySig,
} from "@kadena/cryptography-utils";

class Signer implements SignerInterface {
  async generate(mnemonic: string, derivationPath = ""): Promise<KeyPair> {
    // eslint-disable-next-line no-debugger
    debugger;
    console.log("mnemonic", mnemonic);
    console.log("derivationPath", derivationPath);

    // if (keyPair) {
    //   return keyPair;
    // }
    // const genKeyPairVar = genKeyPair();
    // keyPair = {
    //   address: genKeyPairVar.publicKey,
    //   privateKey: genKeyPairVar.secretKey,
    //   publicKey: genKeyPairVar.publicKey,
    // };

    return {
      address:
        "cb40739853e741e1d9cbe4b72573bbe534d0a8e5df40e90133f9678d266f2e67",
      privateKey:
        "b43d2182bb697f3c99ec6b6fc04d2dd4414951daf2a5a6e010c9c66f06013a39",
      publicKey:
        "cb40739853e741e1d9cbe4b72573bbe534d0a8e5df40e90133f9678d266f2e67",
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string
  ): Promise<boolean> {
    console.log("msgHash", msgHash);
    console.log("sig", sig);
    console.log("publicKey", publicKey);

    return verifySig(
      base64UrlDecodeArr(msgHash),
      hexToBin(sig),
      hexToBin(publicKey)
    );
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    // eslint-disable-next-line no-debugger
    debugger;
    const signResult = sign(msgHash, {
      secretKey: keyPair.privateKey,
      // secretKey: keyPair.privateKey.slice(0, 64),
      publicKey: keyPair.publicKey,
    });

    return signResult.sig;
  }

  bufferToHex(buffer: Iterable<number>): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  hexToBuffer(hex: string): Uint8Array {
    return new Uint8Array(
      hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16))
    );
  }
}

export default Signer;
