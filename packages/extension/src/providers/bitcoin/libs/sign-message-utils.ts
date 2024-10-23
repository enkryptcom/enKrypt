import { sha256 } from 'ethereum-cryptography/sha256';

const MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n');

const varintBufNum = (n: number) => {
  let buf;
  if (n < 253) {
    buf = Buffer.alloc(1);
    buf.writeUInt8(n, 0);
  } else if (n < 0x10000) {
    buf = Buffer.alloc(1 + 2);
    buf.writeUInt8(253, 0);
    buf.writeUInt16LE(n, 1);
  } else if (n < 0x100000000) {
    buf = Buffer.alloc(1 + 4);
    buf.writeUInt8(254, 0);
    buf.writeUInt32LE(n, 1);
  } else {
    buf = Buffer.alloc(1 + 8);
    buf.writeUInt8(255, 0);
    buf.writeInt32LE(n & -1, 1);
    buf.writeUInt32LE(Math.floor(n / 0x100000000), 5);
  }
  return buf;
};

export const magicHash = (messageBuffer: Buffer) => {
  const prefix1 = varintBufNum(MAGIC_BYTES.length);
  const prefix2 = varintBufNum(messageBuffer.length);
  const buf = Buffer.concat([prefix1, MAGIC_BYTES, prefix2, messageBuffer]);
  return Buffer.from(sha256(sha256(buf)));
};

export const toCompact = (
  i: number,
  signature: Uint8Array,
  compressed: boolean,
) => {
  if (!(i === 0 || i === 1 || i === 2 || i === 3)) {
    throw new Error('i must be equal to 0, 1, 2, or 3');
  }
  let val = i + 27 + 4;
  if (!compressed) {
    val = val - 4;
  }
  return Buffer.concat([Uint8Array.of(val), Uint8Array.from(signature)]);
};
