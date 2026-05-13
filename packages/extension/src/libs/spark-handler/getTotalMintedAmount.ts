import BigNumber from 'bignumber.js';
import { firoElectrum } from '@/providers/bitcoin/libs/electrum-client/electrum-client';
import { UnspentTxOutputModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { ECPairInterface } from 'ecpair';

type SpendableUtxo = Omit<UnspentTxOutputModel, 'raw'> & {
  keyPair: ECPairInterface;
};

export const getTotalMintedAmount = async (spendableUtxos: SpendableUtxo[]) => {
  let inputAmount = 0;
  const psbtInputs = [];

  for (const utxo of spendableUtxos) {
    const txRaw = await firoElectrum.getTxRaw(utxo.txid);

    psbtInputs.push({
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from(txRaw, 'hex'),
    });

    inputAmount += utxo.satoshis;
  }

  return { inputAmountBn: new BigNumber(inputAmount), psbtInputs };
};
