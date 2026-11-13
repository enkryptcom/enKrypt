import BigNumber from 'bignumber.js';

export const getTotalMintedAmount = (spendableUtxos: { satoshis: number }[]) =>
  spendableUtxos.reduce(
    (total, utxo) => total.plus(utxo.satoshis),
    new BigNumber(0),
  );
