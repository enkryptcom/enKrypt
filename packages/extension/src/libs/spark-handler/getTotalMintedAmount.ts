import { Utxo } from '@/providers/bitcoin/types/utxo';
import axios from 'axios';
import BigNumber from 'bignumber.js';

export const getTotalMintedAmount = async (spendableUtxos: Utxo[]) => {
  let inputAmount = 0;
  const psbtInputs = [];

  for (const utxo of spendableUtxos) {
    const rawTx = await axios.get(
      `https://explorer.firo.org/insight-api-zcoin/rawtx/${utxo.txid}`,
    );

    psbtInputs.push({
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from(rawTx.data.rawtx, 'hex'),
    });

    inputAmount += utxo.satoshis;
  }

  return { inputAmountBn: new BigNumber(inputAmount), psbtInputs };
};
