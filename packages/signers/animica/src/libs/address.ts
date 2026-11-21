import { sha3_256 } from "@noble/hashes/sha3.js";
import { bech32m } from "@scure/base";

/** bech32 human-readable part for Animica addresses. */
export const ANIMICA_HRP = "anim";
/** ML-DSA-65 (FIPS 204) signature scheme id used in addresses and tx envelopes. */
export const ML_DSA_65_ALG_ID = 0x1003;
/** Address payload: u16be(alg_id) || sha3_256(pubkey). */
const ADDRESS_PAYLOAD_LENGTH = 34;

/**
 * address = bech32m("anim", u16be(alg_id) || SHA3-256(pubkey))
 * SHA3-256 is NIST SHA-3 (not Keccak). bech32m (BIP-350), not bech32.
 * ML-DSA-65 addresses are always 66 characters and start with `anim1zqp`.
 */
export const addressFromPublicKey = (
  publicKey: Uint8Array,
  algId = ML_DSA_65_ALG_ID,
): string => {
  const digest = sha3_256(publicKey);
  const payload = new Uint8Array(ADDRESS_PAYLOAD_LENGTH);
  payload[0] = (algId >> 8) & 0xff;
  payload[1] = algId & 0xff;
  payload.set(digest, 2);
  return bech32m.encode(ANIMICA_HRP, bech32m.toWords(payload));
};
