import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import Transaction from "@/providers/ethereum/libs/transaction";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { fromBase } from "@enkryptcom/utils";
import BigNumber from "bignumber.js";

export const getEVMTransactionFees = async (
  txs: Transaction[],
  network: EvmNetwork,
  price: number
): Promise<GasFeeType> => {
  const gasPromises = txs.map((tx) => {
    return tx.getGasCosts().then(async (gasvals) => {
      const getConvertedVal = (type: GasPriceTypes) =>
        fromBase(gasvals[type], network.decimals);
      return {
        [GasPriceTypes.ECONOMY]: {
          nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
          fiatValue: new BigNumber(
            getConvertedVal(GasPriceTypes.ECONOMY)
          ).times(price),
        },
        [GasPriceTypes.REGULAR]: {
          nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
          fiatValue: new BigNumber(
            getConvertedVal(GasPriceTypes.REGULAR)
          ).times(price),
        },
        [GasPriceTypes.FAST]: {
          nativeValue: getConvertedVal(GasPriceTypes.FAST),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST)).times(
            price
          ),
        },
        [GasPriceTypes.FASTEST]: {
          nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
          fiatValue: new BigNumber(
            getConvertedVal(GasPriceTypes.FASTEST)
          ).times(price),
        },
      };
    });
  });

  const gasVals = await Promise.all(gasPromises);

  const finalVal = gasVals.reduce((prev, curr) => {
    if (!prev) return curr;

    return {
      [GasPriceTypes.ECONOMY]: {
        nativeValue: new BigNumber(prev[GasPriceTypes.ECONOMY].nativeValue)
          .plus(curr[GasPriceTypes.ECONOMY].nativeValue)
          .toString(),
        fiatValue: prev[GasPriceTypes.ECONOMY].fiatValue.plus(
          curr[GasPriceTypes.ECONOMY].fiatValue
        ),
      },
      [GasPriceTypes.REGULAR]: {
        nativeValue: new BigNumber(prev[GasPriceTypes.REGULAR].nativeValue)
          .plus(curr[GasPriceTypes.REGULAR].nativeValue)
          .toString(),
        fiatValue: prev[GasPriceTypes.REGULAR].fiatValue.plus(
          curr[GasPriceTypes.REGULAR].fiatValue
        ),
      },
      [GasPriceTypes.FAST]: {
        nativeValue: new BigNumber(prev[GasPriceTypes.FAST].nativeValue)
          .plus(curr[GasPriceTypes.FAST].nativeValue)
          .toString(),
        fiatValue: prev[GasPriceTypes.FAST].fiatValue.plus(
          curr[GasPriceTypes.FAST].fiatValue
        ),
      },
      [GasPriceTypes.FASTEST]: {
        nativeValue: new BigNumber(prev[GasPriceTypes.FASTEST].nativeValue)
          .plus(curr[GasPriceTypes.FASTEST].nativeValue)
          .toString(),
        fiatValue: prev[GasPriceTypes.FASTEST].fiatValue.plus(
          curr[GasPriceTypes.FASTEST].fiatValue
        ),
      },
    };
  });

  return {
    [GasPriceTypes.ECONOMY]: {
      nativeValue: finalVal[GasPriceTypes.ECONOMY].nativeValue,
      fiatValue: finalVal[GasPriceTypes.ECONOMY].fiatValue.toString(),
      nativeSymbol: network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.REGULAR]: {
      nativeValue: finalVal[GasPriceTypes.REGULAR].nativeValue,
      fiatValue: finalVal[GasPriceTypes.REGULAR].fiatValue.toString(),
      nativeSymbol: network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FAST]: {
      nativeValue: finalVal[GasPriceTypes.FAST].nativeValue,
      fiatValue: finalVal[GasPriceTypes.FAST].fiatValue.toString(),
      nativeSymbol: network.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FASTEST]: {
      nativeValue: finalVal[GasPriceTypes.FASTEST].nativeValue,
      fiatValue: finalVal[GasPriceTypes.FASTEST].fiatValue.toString(),
      nativeSymbol: network.currencyName,
      fiatSymbol: "USD",
    },
  };
};
