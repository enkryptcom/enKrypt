// @vitest-environment node
//
// The bitcoin provider tests run in the node environment: bitcoinjs-lib checks
// Buffer values against Uint8Array, and under jsdom the two come from different
// realms.
import { describe, it, expect } from 'vitest';
import bitcoinNetworks from '../networks';
import { getDustThreshold } from '../libs/utils';

describe('Should report the dust limit in base units', () => {
  it('should convert each network limit from whole coins', () => {
    // 0.00000546 BTC
    expect(getDustThreshold(bitcoinNetworks.bitcoin)).to.be.eq(546);
    expect(getDustThreshold(bitcoinNetworks.bitcoinTest)).to.be.eq(546);
    // 0.0001 LTC, an order of magnitude above the bitcoin limit
    expect(getDustThreshold(bitcoinNetworks.litecoin)).to.be.eq(10000);
    // 0.01 DOGE
    expect(getDustThreshold(bitcoinNetworks.dogecoin)).to.be.eq(1000000);
  });
});
