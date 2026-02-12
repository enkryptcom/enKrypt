import { toBN } from 'web3-utils';
import { toBase, fromBase } from '@enkryptcom/utils';

interface UTXO {
  sats?: number;
  value?: number;
  token?: any;
}

export const calculateUTXOBalance = (
  accountUTXOs: UTXO[],
): ReturnType<typeof toBN> => {
  const nonTokenUTXOs = accountUTXOs.filter((utxo: UTXO) => !utxo.token);
  return toBN(
    nonTokenUTXOs.reduce(
      (acc, utxo) => acc + Number(utxo.sats || utxo.value || 0),
      0,
    ),
  );
};

export const calculateBalanceAfterTransaction = (
  sendAmount: string,
  utxoBalance: ReturnType<typeof toBN>,
  fee: string,
  assetDecimals: number,
  networkDecimals: number,
  isValidAmount: boolean,
): ReturnType<typeof toBN> => {
  if (!isValidAmount) {
    return toBN(0);
  }

  return utxoBalance
    .sub(toBN(toBase(sendAmount, assetDecimals)))
    .sub(toBN(toBase(fee, networkDecimals)));
};

export const isBelowDustLimit = (
  sendAmount: string,
  assetDecimals: number,
  dustLimit: number,
): boolean => {
  const amountInSatoshis = toBase(sendAmount, assetDecimals);
  return Number(amountInSatoshis) < dustLimit && Number(sendAmount) > 0;
};

export const calculateMaxSendableValue = (
  utxoBalance: ReturnType<typeof toBN>,
  fee: string,
  networkDecimals: number,
  assetDecimals: number,
): string => {
  const maxValue = utxoBalance.sub(toBN(toBase(fee, networkDecimals)));
  return fromBase(maxValue.toString(), assetDecimals);
};
