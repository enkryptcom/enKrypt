import { bech32m } from '@scure/base';

/** bech32 human-readable part for Animica addresses. */
export const ANIMICA_HRP = 'anim';
/** Address payload: u16be(alg_id) || sha3_256(pubkey). */
const ADDRESS_PAYLOAD_LENGTH = 34;
/** Contract addresses are keyless (alg_id 0); accounts use a PQ scheme id. */
const ALG_ID_CONTRACT = 0x0000;
const ALG_ID_ACCOUNT_MIN = 0x1000;
const ALG_ID_ACCOUNT_MAX = 0x1fff;

export interface AnimicaAddress {
  algId: number;
  /** 32-byte account digest; this is what the transaction body carries. */
  digest: Uint8Array;
}

/**
 * Decode a bech32m `anim1…` address. Throws on a bad checksum, wrong prefix,
 * wrong payload length or unknown algorithm id.
 */
export const decodeAddress = (address: string): AnimicaAddress => {
  const { prefix, words } = bech32m.decode(address as `${string}1${string}`);
  if (prefix !== ANIMICA_HRP) {
    throw new Error(`Invalid address prefix: expected ${ANIMICA_HRP}`);
  }
  const payload = bech32m.fromWords(words);
  if (payload.length !== ADDRESS_PAYLOAD_LENGTH) {
    throw new Error(
      `Invalid address payload length: expected ${ADDRESS_PAYLOAD_LENGTH}, got ${payload.length}`,
    );
  }
  const algId = (payload[0] << 8) | payload[1];
  if (
    algId !== ALG_ID_CONTRACT &&
    (algId < ALG_ID_ACCOUNT_MIN || algId > ALG_ID_ACCOUNT_MAX)
  ) {
    throw new Error(`Unsupported address algorithm id: ${algId}`);
  }
  return { algId, digest: payload.slice(2) };
};

export const isValidAddress = (address: string): boolean => {
  try {
    decodeAddress(address);
    return true;
  } catch {
    return false;
  }
};

export const addressToDigest = (address: string): Uint8Array =>
  decodeAddress(address).digest;
