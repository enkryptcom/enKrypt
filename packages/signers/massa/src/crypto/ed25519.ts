import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2";
ed.etc.sha512Sync = sha512; // Use the sha512 implementation from noble
import Signer from "./interfaces/signer";

/**
 * Ed25519 implementation of the Signer interface.
 */
export default class Ed25519 implements Signer {
  // eslint-disable-next-line class-methods-use-this -- Expected by the interface.
  generatePrivateKey(): Uint8Array {
    return ed.utils.randomPrivateKey();
  }

  // eslint-disable-next-line class-methods-use-this -- Expected by the interface.
  async getPublicKey(privateKey: Uint8Array): Promise<Uint8Array> {
    return ed.getPublicKey(privateKey);
  }

  // eslint-disable-next-line class-methods-use-this -- Expected by the interface.
  async sign(privateKey: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    return ed.sign(data, privateKey);
  }

  // eslint-disable-next-line class-methods-use-this -- Expected by the interface.
  async verify(
    publicKey: Uint8Array,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    console.log(publicKey, data, signature);
    return ed.verify(signature, data, publicKey);
  }
}
