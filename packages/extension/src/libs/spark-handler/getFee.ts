import { SATOSHI } from '@/providers/bitcoin/libs/firo-wallet/firo-wallet';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';

export const getFee = async (tempTx: bitcoin.Transaction) => {
  const { data } = await axios.get<Record<string, number>>(
    'https://explorer.firo.org/insight-api-zcoin/utils/estimatefee?nbBlocks=2',
  );

  const feeRate = Object.values(data)[0];

  return new BigNumber(feeRate)
    .times(Math.ceil(tempTx.virtualSize() / 1000))
    .times(SATOSHI);
};
