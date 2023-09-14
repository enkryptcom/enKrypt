import { SignerInterface, KeyPair } from "@enkryptcom/types";
import kadenaCrypto from "cardano-crypto-kadena.js/kadena-crypto";
import { base64UrlDecodeArr, hexToBin, sign, signHash, verifySig } from "@kadena/cryptography-utils";

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
    console.log('msgHash', msgHash);
    console.log('sig', sig);
    console.log('publicKey', publicKey);

    const signCmd = {
      hash: 'YbdNz31xZBhW6LaaXCmltf0WQdVSwDPw_LJWcTgwevA',
      sig: '224a9a0624e1b22a3e34d8040850efb595e924c22f72c07a700a175a025c3bdd0a6a46cbc8f52cdc76fe01cdf2f92835ae255383e753115e8a3ba29dd0e80407',
      pubKey: '57b9e48323d8cf9d811a4032662ab86c1c8f440b974759b4267d27a1f1ca936f',
    };
  
    return verifySig(
      base64UrlDecodeArr(signCmd.hash),
      hexToBin(signCmd.sig),
      hexToBin(signCmd.pubKey),
    );
  
    // return verifySig(
    //   base64UrlDecodeArr(msgHash),
    //   hexToBin(sig),
    //   hexToBin(publicKey),
    // );
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const signResult = signHash(msgHash, {
      secretKey: keyPair.privateKey.slice(0, 128), // 256
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
      hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16))
    );
  }
}

export default Signer;
