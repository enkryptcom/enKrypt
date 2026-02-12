import { toBN } from 'web3-utils';
import { toBase, fromBase } from '@enkryptcom/utils';
import BigNumber from 'bignumber.js';
import { GasPriceTypes, GasFeeType } from '@/providers/common/types';
import { extractSats } from '../../libs/utils';

interface UTXO {
  sats?: number;
  value?: number;
  token?: any;
}

interface FeeCalculationParams {
  sendAmount: string;
  accountUTXOs: UTXO[];
  isEToken: boolean;
  selectedAsset: {
    balance?: string;
    decimals: number;
  };
  networkDecimals: number;
  fallbackByteSize?: number;
}

interface FeeCalculationResult {
  feeInXEC: string;
  txSize?: number;
  realFee?: number;
}

export const calculateTransactionFee = (
  params: FeeCalculationParams,
): FeeCalculationResult => {
  const {
    sendAmount,
    accountUTXOs,
    selectedAsset,
    networkDecimals,
    fallbackByteSize = 219,
  } = params;

  let feeInXEC: string = '';
  let txSize: number;

  if (!sendAmount || sendAmount === '0' || accountUTXOs.length === 0) {
    return {
      feeInXEC: fromBase(fallbackByteSize.toString(), networkDecimals),
      txSize: fallbackByteSize,
    };
  }

  try {
    const nonTokenUTXOs = accountUTXOs
      .filter((utxo: UTXO) => !utxo.token)
      .sort((a, b) => {
        const aSats = toBN(extractSats(a));
        const bSats = toBN(extractSats(b));
        if (bSats.gt(aSats)) return 1;
        if (bSats.lt(aSats)) return -1;
        return 0;
      });

    const result = calculateNativeXECFee(
      sendAmount,
      nonTokenUTXOs,
      selectedAsset.decimals,
      networkDecimals,
    );

    txSize = result.txSize!;
    feeInXEC = result.feeInXEC;

    return { feeInXEC, txSize };
  } catch (error) {
    console.warn(
      '⚠️ [calculateTransactionFee] Error calculating fee, using estimate:',
      error,
    );
    return {
      feeInXEC: fromBase(fallbackByteSize.toString(), networkDecimals),
      txSize: fallbackByteSize,
    };
  }
};

const calculateNativeXECFee = (
  sendAmount: string,
  sortedUTXOs: UTXO[],
  assetDecimals: number,
  networkDecimals: number,
): FeeCalculationResult & { leftover?: string } => {
  const amountSats = toBase(sendAmount, assetDecimals);

  let accumulated = toBN(0);
  let numInputs = 0;
  let estimatedFee = 10 + 1 * 141 + 2 * 34;

  let prevNumInputs = 0;
  for (let iteration = 0; iteration < 3; iteration++) {
    accumulated = toBN(0);
    numInputs = 0;
    const target = toBN(amountSats).add(toBN(estimatedFee));

    for (const utxo of sortedUTXOs) {
      accumulated = accumulated.add(toBN(extractSats(utxo)));
      numInputs++;
      if (accumulated.gte(target)) break;
    }

    const newFee = 10 + numInputs * 141 + 2 * 34;
    if (numInputs === prevNumInputs) break; // Converged
    prevNumInputs = numInputs;
    estimatedFee = newFee;
  }

  const txSizeWithChange = 10 + numInputs * 141 + 2 * 34;
  const txSizeNoChange = 10 + numInputs * 141 + 1 * 34;

  // Check if change would be sub-dust (< 546 sats)
  const leftover = accumulated
    .sub(toBN(amountSats))
    .sub(toBN(txSizeWithChange))
    .toString();

  if (toBN(leftover).lt(toBN(546)) && toBN(leftover).gte(toBN(0))) {
    // Sub-dust change: all leftover goes to miner
    const realFee = accumulated.sub(toBN(amountSats)).toString();
    return {
      feeInXEC: fromBase(realFee, networkDecimals),
      txSize: txSizeNoChange,
      realFee: Number(realFee),
      leftover,
    };
  }

  return {
    feeInXEC: fromBase(txSizeWithChange.toString(), networkDecimals),
    txSize: txSizeWithChange,
  };
};

export const buildGasCostValues = (
  feeInXEC: string,
  assetPrice: string,
  currencyName: string,
): GasFeeType => {
  const feeUSD = new BigNumber(feeInXEC).times(assetPrice || '0').toString();

  return {
    [GasPriceTypes.ECONOMY]: {
      nativeValue: new BigNumber(feeInXEC).times(0.8).toString(),
      fiatValue: new BigNumber(feeUSD).times(0.8).toString(),
      nativeSymbol: currencyName,
      fiatSymbol: 'USD',
    },
    [GasPriceTypes.REGULAR]: {
      nativeValue: feeInXEC,
      fiatValue: feeUSD,
      nativeSymbol: currencyName,
      fiatSymbol: 'USD',
    },
    [GasPriceTypes.FAST]: {
      nativeValue: new BigNumber(feeInXEC).times(1.2).toString(),
      fiatValue: new BigNumber(feeUSD).times(1.2).toString(),
      nativeSymbol: currencyName,
      fiatSymbol: 'USD',
    },
    [GasPriceTypes.FASTEST]: {
      nativeValue: new BigNumber(feeInXEC).times(1.5).toString(),
      fiatValue: new BigNumber(feeUSD).times(1.5).toString(),
      nativeSymbol: currencyName,
      fiatSymbol: 'USD',
    },
  };
};
