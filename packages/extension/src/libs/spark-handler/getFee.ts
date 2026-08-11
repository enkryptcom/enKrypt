import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';

/** Matches the flat REGULAR sat/byte rate used for regular Firo transparent
 * sends (see feeHandler in networks/firo.ts) — firoElectrum.estimateFee()
 * has been observed to return wildly inflated rates (100x+ the node's own
 * relayfee), so it isn't used here. */
const SAT_PER_BYTE = 10;

export const getFee = async (tempTx: bitcoin.Transaction) => {
  return new BigNumber(SAT_PER_BYTE).times(tempTx.virtualSize());
};
