import { describe, it, expect } from 'vitest';
import { Psbt, Transaction, payments, networks } from 'bitcoinjs-lib';
import { hexToBuffer } from '@enkryptcom/utils';
import { psbtHasUnsafeSighashType } from '../libs/utils';

const walletPubkey = hexToBuffer(
  '0x021aa21d5f77b1be591d0a0a847cb7412a344f4e768b93d55b3eeab3b7e8a4a252',
);
const otherPubkey = hexToBuffer(
  '0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
);

const buildPsbt = (inputs: { pubkey: Buffer; sighashType?: number }[]) => {
  const psbt = new Psbt({ network: networks.bitcoin });
  inputs.forEach(({ pubkey, sighashType }, idx) => {
    const p2wpkh = payments.p2wpkh({ pubkey, network: networks.bitcoin });
    psbt.addInput({
      hash: '75ddabb27b8845f5247975c8a5ba7c6f336c4570708ebe230caf6db5217ae858',
      index: idx,
      witnessUtxo: { script: p2wpkh.output!, value: 100_000 },
      ...(sighashType !== undefined ? { sighashType } : {}),
    });
  });
  psbt.addOutput({
    address: 'bc1qnjmf6vcjpyru5t8y2936260mrqa305qactwds2',
    value: 99_000,
  });
  return psbt;
};

describe('psbtHasUnsafeSighashType', () => {
  it('should allow inputs without a sighash type', () => {
    const psbt = buildPsbt([{ pubkey: walletPubkey }]);
    expect(psbtHasUnsafeSighashType(psbt, walletPubkey)).to.be.eq(false);
  });

  it('should allow explicit SIGHASH_ALL', () => {
    const psbt = buildPsbt([
      { pubkey: walletPubkey, sighashType: Transaction.SIGHASH_ALL },
    ]);
    expect(psbtHasUnsafeSighashType(psbt, walletPubkey)).to.be.eq(false);
  });

  it('should flag SIGHASH_NONE on a wallet input', () => {
    const psbt = buildPsbt([
      { pubkey: walletPubkey, sighashType: Transaction.SIGHASH_NONE },
    ]);
    expect(psbtHasUnsafeSighashType(psbt, walletPubkey)).to.be.eq(true);
  });

  it('should flag SIGHASH_SINGLE | ANYONECANPAY on a wallet input', () => {
    const psbt = buildPsbt([
      { pubkey: walletPubkey },
      {
        pubkey: walletPubkey,
        sighashType:
          Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY,
      },
    ]);
    expect(psbtHasUnsafeSighashType(psbt, walletPubkey)).to.be.eq(true);
  });

  it('should ignore unsafe sighash types on inputs the wallet does not sign', () => {
    const psbt = buildPsbt([
      { pubkey: walletPubkey },
      { pubkey: otherPubkey, sighashType: Transaction.SIGHASH_NONE },
    ]);
    expect(psbtHasUnsafeSighashType(psbt, walletPubkey)).to.be.eq(false);
  });
});

describe('PSBT signing sighash enforcement', () => {
  it('should refuse to sign a SIGHASH_NONE input when only SIGHASH_ALL is allowed', async () => {
    // Mirrors the signing call shape used in btc-verify-transaction.vue:
    // a dApp-supplied sighashType must not bypass the SIGHASH_ALL allowlist.
    const psbt = buildPsbt([
      { pubkey: walletPubkey, sighashType: Transaction.SIGHASH_NONE },
    ]);
    const fakeSigner = {
      publicKey: walletPubkey,
      sign: () => Buffer.alloc(64),
    };
    await expect(
      psbt.signInputAsync(0, fakeSigner, [Transaction.SIGHASH_ALL]),
    ).rejects.toThrow(/Sighash type is not allowed/);
  });
});
