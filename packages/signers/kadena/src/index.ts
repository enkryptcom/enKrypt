import {
  KeyPair,
  MnemonicWithExtraWord,
  SignerInterface,
} from "@enkryptcom/types";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { mnemonicToSeedSync } from "bip39";
import { sign as tweetSign } from "tweetnacl";
import { derivePath } from "./libs/ed25519";

export class KadenaSigner implements SignerInterface {
  async generate(
    mnemonic: MnemonicWithExtraWord,
    derivationPath = "",
  ): Promise<KeyPair> {
    const seed = bufferToHex(
      mnemonicToSeedSync(mnemonic.mnemonic, mnemonic.extraWord),
      true,
    );
    const dPathSegments = `${derivationPath}'`.split("/");

    const keys = derivePath(dPathSegments.join("/"), seed);
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
    publicKey: string,
  ): Promise<boolean> {
    return tweetSign.detached.verify(
      hexToBuffer(msgHash),
      hexToBuffer(sig),
      hexToBuffer(publicKey),
    );
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const sig = tweetSign.detached(
      hexToBuffer(msgHash),
      hexToBuffer(keyPair.privateKey),
    );
    return bufferToHex(sig);
  }
}
