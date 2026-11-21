import {
  KeyPair,
  MnemonicWithExtraWord,
  SignerInterface,
} from "@enkryptcom/types";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";
import { mnemonicToSeedSync } from "bip39";
import {
  ANIMICA_COIN_TYPE,
  ML_DSA_65_ALG_ID,
  addressFromPublicKey,
  deriveNodeFromSeed,
} from "./libs";

/** FIPS 204 ML-DSA-65 key generation seed length (ξ). */
const SEED_LENGTH = 32;

/** Plain Uint8Array copy (a Buffer may come from a different realm). */
const toBytes = (hex: string): Uint8Array => Uint8Array.from(hexToBuffer(hex));

/**
 * Build an Animica keypair from the 32-byte ML-DSA-65 seed ξ.
 *
 * `privateKey` is the seed itself (32 bytes), not the 4,032-byte expanded
 * secret key: FIPS 204 `KeyGen_internal(ξ)` is deterministic, so the full key
 * is regenerated on every sign.
 */
export const keyPairFromSeed = (seed: Uint8Array): KeyPair => {
  if (seed.length !== SEED_LENGTH) {
    throw new Error(
      `Animica seed must be ${SEED_LENGTH} bytes, got ${seed.length}`,
    );
  }
  const { publicKey } = ml_dsa65.keygen(seed);
  return {
    address: addressFromPublicKey(publicKey, ML_DSA_65_ALG_ID),
    privateKey: bufferToHex(seed),
    publicKey: bufferToHex(publicKey),
  };
};

export class AnimicaSigner implements SignerInterface {
  async generate(
    mnemonic: MnemonicWithExtraWord,
    derivationPath = `m/44'/${ANIMICA_COIN_TYPE}'/0'/0'/0'`,
  ): Promise<KeyPair> {
    const seed = mnemonicToSeedSync(mnemonic.mnemonic, mnemonic.extraWord);
    const { key } = deriveNodeFromSeed(seed, derivationPath);
    return keyPairFromSeed(key);
  }

  /**
   * `msgHash` is the 64-byte Animica sign-hash (SHA3-512 of the domain-separated
   * sign bytes); it is signed as the ML-DSA-65 message in pure mode with an empty
   * context, which is what the node verifies.
   */
  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const { secretKey } = ml_dsa65.keygen(toBytes(keyPair.privateKey));
    const sig = ml_dsa65.sign(toBytes(msgHash), secretKey);
    return bufferToHex(sig);
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string,
  ): Promise<boolean> {
    try {
      return ml_dsa65.verify(
        toBytes(sig),
        toBytes(msgHash),
        toBytes(publicKey),
      );
    } catch (error) {
      console.error("Animica signature verification failed:", error);
      return false;
    }
  }
}

export { ANIMICA_COIN_TYPE, ML_DSA_65_ALG_ID, addressFromPublicKey };
