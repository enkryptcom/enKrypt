/**
 * Animica v2 transfer transaction: body, signing preimage, sign-hash and
 * signed envelope. Byte-exact with the node (`tx.decodeRawTransaction` /
 * `mempool.simulateAdmission` accept the output).
 *
 *   body      = canonical CBOR map (see AnimicaTxBody)
 *   preimage  = CBOR({1: "animica.tx.v1", 2: chainId, 3: genesisHash, 4: "unknown", 5: "tx", 6: 2, 7: body})
 *   signBytes = lp("animica:sign/v1") || lp("tx") || lp(uvarint(chainId)) || lp(uvarint(forkId))
 *               || lp(uvarint(algId)) || lp("") || lp(preimage)        lp(x) = uvarint(len(x)) || x
 *   signHash  = SHA3-512(signBytes)                                   -> signed by ML-DSA-65 (pure mode)
 *   envelope  = CBOR({tx: body, sigs: [{alg: 4099, pubkey, sig}]})
 *   txid      = SHA3-256(envelope)
 */
import { sha3_256, sha3_512 } from '@noble/hashes/sha3.js';
import { bufferToHex, hexToBuffer } from '@enkryptcom/utils';
import { CborValue, encodeCanonical } from './cbor';
import { addressToDigest } from './address';

/** ML-DSA-65 (FIPS 204) signature scheme id. */
export const ML_DSA_65_ALG_ID = 0x1003;
/** Gas used by a plain transfer; fee = gasLimit x gasPrice (nANM). */
export const TRANSFER_GAS_LIMIT = 21000;
/** Transfers are valid for [validAfter, validAfter + TX_VALIDITY_WINDOW] blocks. */
export const TX_VALIDITY_WINDOW = 120;
/** Salt length used for replay protection (txid uniqueness). */
export const TX_SALT_LENGTH = 32;

const SIGN_TAG = 'animica:sign/v1';
const TX_SIGN_DOMAIN = 'animica.tx.v1';
const TX_MESSAGE_TYPE = 'tx';
const TX_BODY_VERSION = 2;
const PAYLOAD_TRANSFER = 0;
/**
 * The chain identity has no network name, so the preimage carries the literal
 * string "unknown" (what the node hashes on mainnet).
 */
const SIGN_NETWORK_NAME = 'unknown';

export interface AnimicaChainContext {
  chainId: number;
  /** 0x-prefixed 32-byte genesis hash. */
  genesisHash: string;
  forkId: number;
}

export interface AnimicaTransferParams {
  from: string;
  to: string;
  /** nANM */
  amount: bigint;
  /** nANM per gas unit */
  gasPrice: bigint;
  gasLimit: number;
  validAfter: number;
  validUntil: number;
  salt: Uint8Array;
  data?: Uint8Array;
}

export type AnimicaTxBody = {
  v: number;
  chainId: number;
  from: Uint8Array;
  gas: { price: bigint; limit: number };
  payload: {
    t: number;
    v: { to: Uint8Array; amount: bigint; data: Uint8Array };
  };
  accessList: CborValue[];
  validAfter: number;
  validUntil: number;
  salt: Uint8Array;
};

const encodeUvarint = (value: number | bigint): Uint8Array => {
  let v = BigInt(value);
  if (v < 0n) throw new Error('uvarint requires a non-negative integer');
  const out: number[] = [];
  do {
    const byte = Number(v & 0x7fn);
    v >>= 7n;
    out.push(v > 0n ? byte | 0x80 : byte);
  } while (v > 0n);
  return Uint8Array.from(out);
};

const lengthPrefixed = (value: Uint8Array): Uint8Array => {
  const length = encodeUvarint(value.length);
  const out = new Uint8Array(length.length + value.length);
  out.set(length, 0);
  out.set(value, length.length);
  return out;
};

const concat = (chunks: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
};

export const buildTransferBody = (
  chainId: number,
  params: AnimicaTransferParams,
): AnimicaTxBody => ({
  v: TX_BODY_VERSION,
  chainId,
  from: addressToDigest(params.from),
  gas: { price: params.gasPrice, limit: params.gasLimit },
  payload: {
    t: PAYLOAD_TRANSFER,
    v: {
      to: addressToDigest(params.to),
      amount: params.amount,
      data: params.data ?? new Uint8Array(0),
    },
  },
  accessList: [],
  validAfter: params.validAfter,
  validUntil: params.validUntil,
  salt: params.salt,
});

export const encodeTxBody = (body: AnimicaTxBody): Uint8Array =>
  encodeCanonical(body);

export const buildSigningPreimage = (
  body: AnimicaTxBody,
  context: AnimicaChainContext,
): Uint8Array =>
  encodeCanonical(
    new Map<number, CborValue>([
      [1, TX_SIGN_DOMAIN],
      [2, context.chainId],
      [3, hexToBuffer(context.genesisHash)],
      [4, SIGN_NETWORK_NAME],
      [5, TX_MESSAGE_TYPE],
      [6, body.v],
      [7, body],
    ]),
  );

export const buildSignBytesRaw = (
  preimage: Uint8Array,
  context: AnimicaChainContext,
  algId = ML_DSA_65_ALG_ID,
): Uint8Array => {
  const utf8 = new TextEncoder();
  return concat([
    lengthPrefixed(utf8.encode(SIGN_TAG)),
    lengthPrefixed(utf8.encode(TX_MESSAGE_TYPE)),
    lengthPrefixed(encodeUvarint(context.chainId)),
    lengthPrefixed(encodeUvarint(context.forkId)),
    lengthPrefixed(encodeUvarint(algId)),
    lengthPrefixed(new Uint8Array(0)),
    lengthPrefixed(preimage),
  ]);
};

/** The 64-byte digest the keyring signs (ML-DSA-65 message, empty context). */
export const computeSignHash = (
  body: AnimicaTxBody,
  context: AnimicaChainContext,
  algId = ML_DSA_65_ALG_ID,
): Uint8Array =>
  sha3_512(
    buildSignBytesRaw(buildSigningPreimage(body, context), context, algId),
  );

export const encodeSignedTransaction = (
  body: AnimicaTxBody,
  publicKey: Uint8Array,
  signature: Uint8Array,
  algId = ML_DSA_65_ALG_ID,
): Uint8Array =>
  encodeCanonical({
    tx: body,
    sigs: [{ alg: algId, pubkey: publicKey, sig: signature }],
  });

/** txid = SHA3-256(envelope), 0x-prefixed. */
export const computeTxId = (envelope: Uint8Array): string =>
  bufferToHex(sha3_256(envelope));
