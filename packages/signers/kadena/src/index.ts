import { SignerInterface, KeyPair } from "@enkryptcom/types";
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import {
  sign,
  verifySig,
  binToHex,
  hexToBin,
  base64UrlDecodeArr,
  restoreKeyPairFromSecretKey
} from '@kadena/cryptography-utils';

class Signer implements SignerInterface {
  async generate(mnemonic: string, derivationPath = ""): Promise<KeyPair> {
    const seed = binToHex(mnemonicToSeedSync(mnemonic));
    const keys = derivePath("m/44'/626'/0'", seed, 0x80000000 + Number(derivationPath));
    const keyPair = restoreKeyPairFromSecretKey(binToHex(keys.key));
    
    return {
      address: `k:${keyPair.publicKey}`,
      privateKey: keyPair.secretKey,
      publicKey: keyPair.publicKey,
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string
  ): Promise<boolean> {
    return verifySig(base64UrlDecodeArr(msgHash), hexToBin(sig), hexToBin(publicKey));
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    return sign(msgHash, {
      publicKey: keyPair.publicKey,
      secretKey: keyPair.privateKey
    }).sig;
  }
}

export default Signer;
