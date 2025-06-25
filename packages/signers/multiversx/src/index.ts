import {
  KeyPair,
  MnemonicWithExtraWord,
  SignerInterface,
} from "@enkryptcom/types";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { Mnemonic, UserPublicKey, UserSecretKey } from "@multiversx/sdk-core";

export class MultiversXSigner implements SignerInterface {
  async generate(
    mnemonic: MnemonicWithExtraWord,
    derivationPath = "",
  ): Promise<KeyPair> {
    const sdkMnemonic = Mnemonic.fromString(mnemonic.mnemonic);

    const dPathSegments = `${derivationPath}`.split("/");
    const index = Number(dPathSegments.slice(-1)[0].replace("'", "")) || 0;
    const secretKey = sdkMnemonic.deriveKey(index, mnemonic.extraWord);
    const pubKey = secretKey.generatePublicKey();

    return {
      address: pubKey.toAddress().toBech32(),
      privateKey: secretKey.hex(),
      publicKey: pubKey.hex(),
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string,
  ): Promise<boolean> {
    const verifier = new UserPublicKey(hexToBuffer(publicKey));
    return verifier.verify(hexToBuffer(msgHash), hexToBuffer(sig));
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const signer = new UserSecretKey(hexToBuffer(keyPair.privateKey));
    const signature = signer.sign(hexToBuffer(msgHash));

    return bufferToHex(signature);
  }
}
