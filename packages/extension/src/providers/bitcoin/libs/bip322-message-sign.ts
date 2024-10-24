/**
 * reference: https://github.com/unisat-wallet/wallet-sdk/blob/master/src/message/bip322-simple.ts
 * reference: https://github.com/bitcoinjs/varuint-bitcoin/blob/master/index.js
 */

import { BitcoinNetwork, PaymentType } from '../types/bitcoin-network';
import { address as BTCAddress, Transaction, Psbt } from 'bitcoinjs-lib';
import { sha256 } from 'ethereum-cryptography/sha256';
import { PSBTSigner } from '../ui/libs/signer';
import { bufferToHex, hexToBuffer } from '@enkryptcom/utils';

const bip0322_hash = (message: string) => {
  const tag = 'BIP0322-signed-message';
  const tagHash = sha256(Buffer.from(tag));
  const result = sha256(
    Buffer.concat([tagHash, tagHash, Buffer.from(message)]),
  );
  return bufferToHex(result, true);
};

const MAX_SAFE_INTEGER = 9007199254740991;

const checkUInt53 = (n: number) => {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0)
    throw new RangeError('value out of range');
};

const encodingLength = (number: number) => {
  checkUInt53(number);

  return number < 0xfd
    ? 1
    : number <= 0xffff
      ? 3
      : number <= 0xffffffff
        ? 5
        : 9;
};
export const encode = (number: number, buffer?: Buffer, offset?: number) => {
  checkUInt53(number);

  if (!buffer) buffer = Buffer.allocUnsafe(encodingLength(number));
  if (!Buffer.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance');
  if (!offset) offset = 0;

  // 8 bit
  if (number < 0xfd) {
    buffer.writeUInt8(number, offset);

    // 16 bit
  } else if (number <= 0xffff) {
    buffer.writeUInt8(0xfd, offset);
    buffer.writeUInt16LE(number, offset + 1);

    // 32 bit
  } else if (number <= 0xffffffff) {
    buffer.writeUInt8(0xfe, offset);
    buffer.writeUInt32LE(number, offset + 1);

    // 64 bit
  } else {
    buffer.writeUInt8(0xff, offset);
    buffer.writeUInt32LE(number >>> 0, offset + 1);
    buffer.writeUInt32LE((number / 0x100000000) | 0, offset + 5);
  }

  return buffer;
};

export const decode = (buffer: Buffer, offset: number) => {
  if (!Buffer.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance');
  if (!offset) offset = 0;
  const first = buffer.readUInt8(offset);
  // 8 bit
  if (first < 0xfd) {
    return first;
    // 16 bit
  } else if (first === 0xfd) {
    return buffer.readUInt16LE(offset + 1);
    // 32 bit
  } else if (first === 0xfe) {
    return buffer.readUInt32LE(offset + 1);
    // 64 bit
  } else {
    const lo = buffer.readUInt32LE(offset + 1);
    const hi = buffer.readUInt32LE(offset + 5);
    const number = hi * 0x0100000000 + lo;
    checkUInt53(number);
    return number;
  }
};

const encodeVarString = (b: Buffer) => {
  return Buffer.concat([encode(b.byteLength), b]);
};

export function getPSBTMessageOfBIP322Simple({
  message,
  address,
  network,
}: {
  message: string;
  address: string;
  network: BitcoinNetwork;
}) {
  const outputScript = BTCAddress.toOutputScript(
    network.displayAddress(address),
    network.networkInfo,
  );
  const addressType = network.networkInfo.paymentType;
  const supportedTypes = [PaymentType.P2WPKH];
  if (supportedTypes.includes(addressType) == false) {
    throw new Error('Not support address type to sign');
  }

  const prevoutHash = Buffer.from(
    '0000000000000000000000000000000000000000000000000000000000000000',
    'hex',
  );
  const prevoutIndex = 0xffffffff;
  const sequence = 0;
  const scriptSig = Buffer.concat([
    Buffer.from('0020', 'hex'),
    Buffer.from(bip0322_hash(message), 'hex'),
  ]);

  const txToSpend = new Transaction();
  txToSpend.version = 0;
  txToSpend.addInput(prevoutHash, prevoutIndex, sequence, scriptSig);
  txToSpend.addOutput(outputScript, 0);

  const psbtToSign = new Psbt();
  psbtToSign.setVersion(0);
  psbtToSign.addInput({
    hash: txToSpend.getHash(),
    index: 0,
    sequence: 0,
    witnessUtxo: {
      script: outputScript,
      value: 0,
    },
    bip32Derivation: [
      {
        masterFingerprint: Buffer.from('4ab28551', 'hex'), // this will be replaced in hw signer
        pubkey: hexToBuffer(address),
        path: "m/84'/0'/0'/0/0", // this will be replaced in hw signer
      },
    ],
  });
  psbtToSign.addOutput({ script: Buffer.from('6a', 'hex'), value: 0 });

  return {
    psbtToSign,
    txdata: txToSpend,
  };
}

export function getSignatureFromSignedTransaction(strTx: string): string {
  const txToSign = Transaction.fromHex(strTx);
  const len = encode(txToSign.ins[0].witness.length);
  const result = Buffer.concat([
    len,
    ...txToSign.ins[0].witness.map(w => encodeVarString(w)),
  ]);
  const signature = result.toString('base64');

  return signature;
}

export async function signMessageOfBIP322Simple({
  message,
  address,
  network,
  Signer,
}: {
  message: string;
  address: string;
  network: BitcoinNetwork;
  Signer: ReturnType<typeof PSBTSigner>;
}) {
  const psbtToSign = getPSBTMessageOfBIP322Simple({
    message,
    address,
    network,
  }).psbtToSign;
  await psbtToSign.signAllInputsAsync(Signer);
  psbtToSign.finalizeAllInputs();
  const txToSign = psbtToSign.extractTransaction();
  return getSignatureFromSignedTransaction(txToSign.toHex());
}
