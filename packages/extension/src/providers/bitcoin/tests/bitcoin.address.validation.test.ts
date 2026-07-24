// @vitest-environment node
//
// bitcoinjs-lib verifies an ECC library by feeding it `Buffer.from(...)` test
// vectors, and @noble/curves rejects anything that is not a `Uint8Array`. Under
// the default jsdom environment those two come from different realms, so the
// `instanceof` check fails and `initEccLib` throws even though the library is
// fine. In a browser there is a single realm and the bundled Buffer polyfill
// extends that realm's Uint8Array, so this only affects the test harness.
import { describe, it, expect } from 'vitest';
import bitcoinNetworks from '../networks';
import { isAddress } from '../libs/utils';
import {
  calculateSizeBasedOnType,
  getOutputCounterForAddress,
} from '../ui/libs/tx-size';
import { PaymentType } from '../types/bitcoin-network';

const bitcoin = bitcoinNetworks.bitcoin.networkInfo;
const litecoin = bitcoinNetworks.litecoin.networkInfo;

// BIP86 test vector
const TAPROOT =
  'bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr';
const NATIVE_SEGWIT = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const P2SH = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';
const P2PKH = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
const P2WSH = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

describe('Should validate bitcoin recipient addresses', () => {
  it('should accept taproot addresses', () => {
    expect(isAddress(TAPROOT, bitcoin)).to.be.eq(true);
  });

  it('should accept every other standard mainnet address type', () => {
    expect(isAddress(NATIVE_SEGWIT, bitcoin)).to.be.eq(true);
    expect(isAddress(P2WSH, bitcoin)).to.be.eq(true);
    expect(isAddress(P2SH, bitcoin)).to.be.eq(true);
    expect(isAddress(P2PKH, bitcoin)).to.be.eq(true);
  });

  it('should reject malformed addresses and addresses from another network', () => {
    expect(isAddress('not an address', bitcoin)).to.be.eq(false);
    expect(isAddress('', bitcoin)).to.be.eq(false);
    // valid taproot address, wrong network
    expect(isAddress(TAPROOT, litecoin)).to.be.eq(false);
    // checksum broken on the last character
    expect(isAddress(`${TAPROOT.slice(0, -1)}p`, bitcoin)).to.be.eq(false);
  });
});

describe('Should size outputs by their address type', () => {
  it('should classify bech32 and bech32m outputs', () => {
    expect(getOutputCounterForAddress(TAPROOT)).to.be.eq('p2tr_output_count');
    expect(getOutputCounterForAddress(NATIVE_SEGWIT)).to.be.eq(
      'p2wpkh_output_count',
    );
    expect(getOutputCounterForAddress(P2WSH)).to.be.eq('p2wsh_output_count');
  });

  it('should fall back to the account type for anything else', () => {
    expect(getOutputCounterForAddress(P2SH)).to.be.eq(undefined);
    expect(getOutputCounterForAddress(P2PKH)).to.be.eq(undefined);
    expect(getOutputCounterForAddress('')).to.be.eq(undefined);
  });

  it('should charge for the larger taproot output', () => {
    const toSegwit = calculateSizeBasedOnType(1, 2, PaymentType.P2WPKH, [
      NATIVE_SEGWIT,
    ]);
    const toTaproot = calculateSizeBasedOnType(1, 2, PaymentType.P2WPKH, [
      TAPROOT,
    ]);
    // P2TR_OUT_SIZE (43) - P2WPKH_OUT_SIZE (31)
    expect(toTaproot - toSegwit).to.be.eq(12);
  });

  it('should size unknown outputs as the account type, as before', () => {
    const withoutAddresses = calculateSizeBasedOnType(1, 2, PaymentType.P2WPKH);
    expect(
      calculateSizeBasedOnType(1, 2, PaymentType.P2WPKH, [NATIVE_SEGWIT]),
    ).to.be.eq(withoutAddresses);
    expect(calculateSizeBasedOnType(1, 2, PaymentType.P2WPKH, [''])).to.be.eq(
      withoutAddresses,
    );
    expect(calculateSizeBasedOnType(1, 2, PaymentType.P2WPKH, [P2SH])).to.be.eq(
      withoutAddresses,
    );
  });
});
