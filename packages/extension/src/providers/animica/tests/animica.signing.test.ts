import { describe, it, expect } from 'vitest';
import { bufferToHex, hexToBuffer } from '@enkryptcom/utils';
import { encodeCanonical } from '../libs/cbor';
import { decodeAddress, isValidAddress } from '../libs/address';
import {
  AnimicaChainContext,
  buildSignBytesRaw,
  buildSigningPreimage,
  buildTransferBody,
  computeSignHash,
  encodeSignedTransaction,
  encodeTxBody,
} from '../libs/transaction';

/**
 * Byte-exact test vector from the Animica wallet integration spec, verified
 * against the mainnet node's admission path (`mempool.simulateAdmission`).
 */
const MAINNET: AnimicaChainContext = {
  chainId: 1,
  genesisHash:
    '0xa0892158cf997c56e91d0aa12e60c36037dae34800a2b54111a8fa17ec88b7de',
  forkId: 3511060514,
};
const FROM =
  'anim1zqpay9pht55sfmasy38z5qrtycn3hedsrpdkka26hskhepsq7uzgrhq5h2mq9';
const FROM_DIGEST =
  'd214375d2904efb0244e2a006b26271be5b0185b6b755abc2d7c8600f70481dc';
// sha3_256("example recipient") wrapped as an ML-DSA-65 address
const TO = 'anim1zqp3f2hhlcwrrlkdv4m3n0cxw7fssvqzjhk7hv2vr45veagjk9v0afgmxrcsu';
const TO_DIGEST =
  '14aaf7fe1c31fecd657719bf06779308300295edebb14c1d68ccf512b158fea5';

const BODY_CBOR =
  'a961760263676173a2656c696d6974195208657072696365016466726f6d5820d214375d2904efb0244e2a006b26271be5b0185b6b755abc2d7c8600f70481dc6473616c745000112233445566778899aabbccddeeff67636861696e496401677061796c6f6164a26174006176a362746f582014aaf7fe1c31fecd657719bf06779308300295edebb14c1d68ccf512b158fea564646174614066616d6f756e741903e86a6163636573734c697374806a76616c696441667465721a000138736a76616c6964556e74696c1a000138eb';
const PREIMAGE_PREFIX =
  'a7016d616e696d6963612e74782e76310201035820a0892158cf997c56e91d0aa12e60c36037dae34800a2b54111a8fa17ec88b7de0467756e6b6e6f776e05627478060207';
const SIGN_BYTES_PREFIX =
  '0f616e696d6963613a7369676e2f7631027478010105a2909a8a0d028320009402a7';
const SIGN_HASH =
  'e3a0ed598d7c9278f5588f9683cefb5b79fc5e93ee20ff411b97d32b4d770f64cc9893a853828e3e35213548e6b3576b8b4fd3c9a933ec69a590d0ef226b9d08';

const body = buildTransferBody(MAINNET.chainId, {
  from: FROM,
  to: TO,
  amount: 1000n,
  gasPrice: 1n,
  gasLimit: 21000,
  validAfter: 79987,
  validUntil: 80107,
  salt: hexToBuffer('00112233445566778899aabbccddeeff'),
});

describe('Animica canonical CBOR', () => {
  const hex = (value: Parameters<typeof encodeCanonical>[0]) =>
    bufferToHex(encodeCanonical(value), true);

  it('encodes integers with the shortest form', () => {
    expect(hex(0)).toBe('00');
    expect(hex(23)).toBe('17');
    expect(hex(24)).toBe('1818');
    expect(hex(255)).toBe('18ff');
    expect(hex(256)).toBe('190100');
    expect(hex(65535)).toBe('19ffff');
    expect(hex(65536)).toBe('1a00010000');
    expect(hex(4294967295)).toBe('1affffffff');
    expect(hex(4294967296n)).toBe('1b0000000100000000');
    expect(hex(-1)).toBe('20');
    expect(hex(-25)).toBe('3818');
    expect(() => encodeCanonical(1.5)).toThrow();
    expect(() => encodeCanonical(2n ** 64n)).toThrow();
  });

  it('sorts map keys by their encoded bytes', () => {
    // shorter keys first, then bytewise: "v" < "gas" < "from" < "validUntil"
    expect(hex({ validUntil: 1, v: 2, gas: 3, from: 4 })).toBe(
      'a461760263676173036466726f6d046a76616c6964556e74696c01',
    );
    expect(
      hex(
        new Map<number | string, number>([
          [7, 1],
          [1, 2],
        ]),
      ),
    ).toBe('a201020701');
  });

  it('encodes strings, bytes, arrays and simple values', () => {
    expect(hex('tx')).toBe('627478');
    expect(hex(new Uint8Array([1, 2, 3]))).toBe('43010203');
    expect(hex([])).toBe('80');
    expect(hex([1, 'a'])).toBe('82016161');
    expect(hex(true)).toBe('f5');
    expect(hex(false)).toBe('f4');
    expect(hex(null)).toBe('f6');
  });
});

describe('Animica addresses', () => {
  it('decodes bech32m addresses to the 32-byte digest', () => {
    const decoded = decodeAddress(FROM);
    expect(decoded.algId).toBe(0x1003);
    expect(bufferToHex(decoded.digest, true)).toBe(FROM_DIGEST);
    expect(bufferToHex(decodeAddress(TO).digest, true)).toBe(TO_DIGEST);
  });

  it('validates addresses', () => {
    expect(isValidAddress(FROM)).toBe(true);
    expect(
      isValidAddress(
        'anim1zqpn54yt2fz07wg5zz33qplkh7tewv30tm5s9cdwvag6kf6myvd2d5sj9pzp7',
      ),
    ).toBe(true);
    // bad checksum
    expect(isValidAddress(FROM.slice(0, -1) + 'q')).toBe(false);
    // wrong prefix
    expect(isValidAddress('anom' + FROM.slice(4))).toBe(false);
    // not bech32m (bitcoin bech32)
    expect(isValidAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(
      false,
    );
    expect(isValidAddress('')).toBe(false);
    expect(isValidAddress('0xd214375d2904efb0244e2a006b26271be5b0185b')).toBe(
      false,
    );
  });
});

describe('Animica transaction signing pipeline', () => {
  it('encodes the v2 transfer body canonically', () => {
    expect(bufferToHex(encodeTxBody(body), true)).toBe(BODY_CBOR);
  });

  it('builds the signing preimage', () => {
    const preimage = buildSigningPreimage(body, MAINNET);
    expect(preimage.length).toBe(276);
    expect(bufferToHex(preimage, true)).toBe(PREIMAGE_PREFIX + BODY_CBOR);
  });

  it('builds the domain-separated sign bytes', () => {
    const signBytes = buildSignBytesRaw(
      buildSigningPreimage(body, MAINNET),
      MAINNET,
    );
    expect(signBytes.length).toBe(309);
    expect(bufferToHex(signBytes.slice(0, 34), true)).toBe(SIGN_BYTES_PREFIX);
  });

  it('computes the sign hash', () => {
    expect(bufferToHex(computeSignHash(body, MAINNET), true)).toBe(SIGN_HASH);
  });

  it('binds the sign hash to the fork id and genesis hash', () => {
    expect(
      bufferToHex(computeSignHash(body, { ...MAINNET, forkId: 1 }), true),
    ).not.toBe(SIGN_HASH);
    expect(
      bufferToHex(
        computeSignHash(body, {
          ...MAINNET,
          genesisHash: '0x' + '00'.repeat(32),
        }),
        true,
      ),
    ).not.toBe(SIGN_HASH);
  });

  it('encodes the signed envelope', () => {
    const envelope = encodeSignedTransaction(
      body,
      new Uint8Array(1952),
      new Uint8Array(3309),
    );
    expect(envelope.length).toBe(5503);
    expect(bufferToHex(envelope.slice(0, 12), true)).toBe(
      'a2627478a961760263676173',
    );
  });
});
