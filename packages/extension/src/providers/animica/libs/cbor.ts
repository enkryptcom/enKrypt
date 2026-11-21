/**
 * Minimal canonical CBOR encoder (RFC 8949 §4.2.1) for Animica transactions.
 *
 *  - integers use the shortest possible encoding
 *  - byte strings, text strings, arrays and maps use definite lengths only
 *  - map keys are sorted by the bytes of their encoded form
 *  - no floats, tags or indefinite-length items
 *
 * The node rejects non-canonical input and the signature covers the encoded
 * bytes, so this must match the node byte-for-byte.
 */

export type CborMap = Map<number | string, CborValue>;
export type CborValue =
  | number
  | bigint
  | string
  | boolean
  | null
  | Uint8Array
  | CborValue[]
  | CborMap
  | { [key: string]: CborValue };

const MAJOR_UINT = 0;
const MAJOR_NEGINT = 1;
const MAJOR_BYTES = 2;
const MAJOR_TEXT = 3;
const MAJOR_ARRAY = 4;
const MAJOR_MAP = 5;
const SIMPLE_FALSE = 0xf4;
const SIMPLE_TRUE = 0xf5;
const SIMPLE_NULL = 0xf6;

const encodeHeader = (major: number, value: bigint): Uint8Array => {
  const mt = major << 5;
  if (value < 24n) return Uint8Array.of(mt | Number(value));
  if (value <= 0xffn) return Uint8Array.of(mt | 24, Number(value));
  if (value <= 0xffffn) {
    return Uint8Array.of(mt | 25, Number(value >> 8n), Number(value & 0xffn));
  }
  if (value <= 0xffffffffn) {
    return Uint8Array.of(
      mt | 26,
      Number((value >> 24n) & 0xffn),
      Number((value >> 16n) & 0xffn),
      Number((value >> 8n) & 0xffn),
      Number(value & 0xffn),
    );
  }
  if (value <= 0xffffffffffffffffn) {
    const out = new Uint8Array(9);
    out[0] = mt | 27;
    for (let i = 0; i < 8; i++) {
      out[8 - i] = Number((value >> BigInt(8 * i)) & 0xffn);
    }
    return out;
  }
  throw new Error('CBOR: integer does not fit in 64 bits');
};

const encodeInteger = (value: bigint): Uint8Array =>
  value >= 0n
    ? encodeHeader(MAJOR_UINT, value)
    : encodeHeader(MAJOR_NEGINT, -1n - value);

const concat = (chunks: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
};

/** Bytewise lexicographic comparison; a strict prefix sorts first. */
const compareBytes = (a: Uint8Array, b: Uint8Array): number => {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
};

const encodeMapEntries = (
  entries: [number | string, CborValue][],
): Uint8Array => {
  const encoded = entries.map(([key, value]) => ({
    key: encodeCanonical(key),
    value: encodeCanonical(value),
  }));
  encoded.sort((a, b) => compareBytes(a.key, b.key));
  return concat([
    encodeHeader(MAJOR_MAP, BigInt(encoded.length)),
    ...encoded.flatMap(e => [e.key, e.value]),
  ]);
};

export const encodeCanonical = (value: CborValue): Uint8Array => {
  if (value === null) return Uint8Array.of(SIMPLE_NULL);
  if (typeof value === 'boolean') {
    return Uint8Array.of(value ? SIMPLE_TRUE : SIMPLE_FALSE);
  }
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(`CBOR: only safe integers are supported, got ${value}`);
    }
    return encodeInteger(BigInt(value));
  }
  if (typeof value === 'bigint') return encodeInteger(value);
  if (typeof value === 'string') {
    const utf8 = new TextEncoder().encode(value);
    return concat([encodeHeader(MAJOR_TEXT, BigInt(utf8.length)), utf8]);
  }
  if (ArrayBuffer.isView(value)) {
    // Uint8Array, or a Buffer (which may come from a different realm)
    const bytes = new Uint8Array(
      value.buffer,
      value.byteOffset,
      value.byteLength,
    );
    return concat([encodeHeader(MAJOR_BYTES, BigInt(bytes.length)), bytes]);
  }
  if (Array.isArray(value)) {
    return concat([
      encodeHeader(MAJOR_ARRAY, BigInt(value.length)),
      ...value.map(encodeCanonical),
    ]);
  }
  if (value instanceof Map) return encodeMapEntries([...value.entries()]);
  if (typeof value === 'object') return encodeMapEntries(Object.entries(value));
  throw new Error(`CBOR: unsupported value type ${typeof value}`);
};
