import {
  KeyPair,
  MnemonicWithExtraWord,
  SignerInterface,
} from "@enkryptcom/types";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { mnemonicToSeedSync } from "bip39";
import { sign as tweetSign } from "tweetnacl";
import { derivePath } from "./libs/ed25519";
import { Address, PublicKey, PrivateKey, Signature } from "@massalabs/massa-web3";

export class MassaSigner implements SignerInterface {
  async generate(
    mnemonic: MnemonicWithExtraWord,
    derivationPath = "",
  ): Promise<KeyPair> {
    console.log('MassaSigner generate', derivationPath);
    const seed = bufferToHex(
      mnemonicToSeedSync(mnemonic.mnemonic, mnemonic.extraWord),
      true,
    );
    const keys = derivePath(derivationPath, seed);
    const keyPair = tweetSign.keyPair.fromSeed(keys.key);
    
    // Prefix the 32-byte private key with version bytes for Massa
    const versionBytes = Buffer.from([0]); // KEYS_VERSION_NUMBER = 0
    const privateKeyBytes = Buffer.concat([versionBytes, Buffer.from(keyPair.secretKey.slice(0, 32))]);
    const privateKey = PrivateKey.fromBytes(privateKeyBytes);
    const publicKey = await PublicKey.fromPrivateKey(privateKey)
    const address = Address.fromPublicKey(publicKey);
    console.log('address', address.toString());
    console.log('privateKey', privateKey.toString());
    console.log('publicKey', publicKey.toString());
    return {
      address: address.toString(),
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString(),
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string,
  ): Promise<boolean> {
    try {
        console.log('MassaSigner verify publicKey', publicKey);

      const massaPublicKey = PublicKey.fromString(publicKey);
      const signature = Signature.fromBytes(hexToBuffer(sig));
      return massaPublicKey.verify(hexToBuffer(msgHash), signature);
    } catch (error) {
      console.error('Massa signature verification failed:', error);
      return false;
    }
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    console.log('MassaSigner sign keyPair', keyPair);
    const privateKey = PrivateKey.fromString(keyPair.privateKey);
    const sig = await privateKey.sign(hexToBuffer(msgHash));

    return bufferToHex(sig.toBytes());
  }
} 