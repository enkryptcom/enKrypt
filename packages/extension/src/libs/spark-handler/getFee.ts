import { SATOSHI } from '@/providers/bitcoin/libs/firo-wallet/firo-wallet';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { firoElectrum } from '@/providers/bitcoin/libs/electrum-client/electrum-client';

export const getFee = async (tempTx: bitcoin.Transaction) => {
  const feeRate = (await firoElectrum.estimateFee(2)) as number;

  return new BigNumber(feeRate)
    .times(Math.ceil(tempTx.virtualSize() / 1000))
    .times(SATOSHI);
};
