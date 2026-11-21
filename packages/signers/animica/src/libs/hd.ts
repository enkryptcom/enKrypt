/**
 * SLIP-0010 (ed25519 family) hardened-only derivation used by Animica.
 *
 * Animica accounts are ML-DSA-65 (FIPS 204) keypairs. FIPS 204 key generation is a
 * pure function of a 32-byte seed ξ, so an HD wallet only needs a deterministic way
 * to turn a BIP-39 seed into one ξ per account. Animica fixes that mapping as
 * SLIP-0010 / ed25519-style HMAC-SHA512 derivation (all levels hardened) along
 *
 *   m / 44' / 4279885' / account' / 0' / index'      (4279885 = 0x414E4D = "ANM")
 *
 * and the 32-byte private-key half of the final node IS ξ (no extra hashing).
 * Spec: https://github.com/animicaorg/all/blob/main/docs/wallet/HD_DERIVATION.md
 */
import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";

/** SLIP-0044 coin type for Animica: 0x414E4D = ASCII "ANM". */
export const ANIMICA_COIN_TYPE = 4279885;

const HARDENED_OFFSET = 0x80000000;
const ED25519_SEED_KEY = new TextEncoder().encode("ed25519 seed");

export interface HDNode {
  /** 32-byte private-key half (for Animica: the ML-DSA-65 seed ξ). */
  key: Uint8Array;
  /** 32-byte chain code. */
  chainCode: Uint8Array;
}

const ser32 = (i: number): Uint8Array => {
  const out = new Uint8Array(4);
  out[0] = (i >>> 24) & 0xff;
  out[1] = (i >>> 16) & 0xff;
  out[2] = (i >>> 8) & 0xff;
  out[3] = i & 0xff;
  return out;
};

const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
};

/** SLIP-0010 master node (ed25519 family) from a BIP-39 seed. */
export const masterNodeFromSeed = (seed: Uint8Array): HDNode => {
  if (seed.length < 16 || seed.length > 64) {
    throw new Error(`HD seed must be 16..64 bytes, got ${seed.length}`);
  }
  const I = hmac(sha512, ED25519_SEED_KEY, seed);
  return { key: I.slice(0, 32), chainCode: I.slice(32, 64) };
};

/** SLIP-0010 hardened child. `index` is the raw (un-hardened) index. */
export const deriveHardenedChild = (parent: HDNode, index: number): HDNode => {
  if (!Number.isInteger(index) || index < 0 || index >= HARDENED_OFFSET) {
    throw new Error(
      `child index must be an integer in [0, 2^31), got ${index}`,
    );
  }
  const i = (index + HARDENED_OFFSET) >>> 0;
  const data = concat(new Uint8Array([0x00]), parent.key, ser32(i));
  const I = hmac(sha512, parent.chainCode, data);
  return { key: I.slice(0, 32), chainCode: I.slice(32, 64) };
};

/**
 * Parse a path such as `m/44'/4279885'/0'/0'/0'`.
 * Every level MUST be hardened (SLIP-0010 ed25519 has no non-hardened children).
 */
export const parsePath = (path: string): number[] => {
  const parts = path.trim().split("/");
  if (parts[0] !== "m") throw new Error(`path must start with "m": ${path}`);
  return parts.slice(1).map((p) => {
    const m = /^(\d+)(['hH])$/.exec(p);
    if (!m) {
      throw new Error(
        `every Animica path level must be hardened (e.g. 44'): bad segment "${p}" in ${path}`,
      );
    }
    const n = Number(m[1]);
    if (n >= HARDENED_OFFSET) throw new Error(`index out of range: ${p}`);
    return n;
  });
};

/** Derive the node at an all-hardened path from a BIP-39 seed. */
export const deriveNodeFromSeed = (seed: Uint8Array, path: string): HDNode => {
  let node = masterNodeFromSeed(seed);
  for (const idx of parsePath(path)) node = deriveHardenedChild(node, idx);
  return node;
};
