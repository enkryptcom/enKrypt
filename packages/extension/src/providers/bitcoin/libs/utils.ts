import { BitcoinNetworkInfo } from "../types";
import { address as BTCAddress } from "bitcoinjs-lib";
import { GasPriceTypes } from "@/providers/common/types";
import { fromBase } from "@/libs/utils/units";
import BigNumber from "bignumber.js";

const isAddress = (address: string, network: BitcoinNetworkInfo): boolean => {
  try {
    BTCAddress.toOutputScript(address, network);
    return true;
  } catch {
    return false;
  }
};
const getGasCostValues = (
  byteSize: number,
  nativeVal = "0",
  decimals: number,
  currencyName: string
) => {
  const gasVals = {
    [GasPriceTypes.FASTEST]: (byteSize * 25).toString(),
    [GasPriceTypes.FAST]: (byteSize * 20).toString(),
    [GasPriceTypes.REGULAR]: (byteSize * 10).toString(),
    [GasPriceTypes.ECONOMY]: (byteSize * 5).toString(),
  };
  const getConvertedVal = (type: GasPriceTypes) =>
    fromBase(gasVals[type], decimals);

  const gasCostValues = {
    [GasPriceTypes.ECONOMY]: {
      nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
      fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.ECONOMY))
        .times(nativeVal!)
        .toString(),
      nativeSymbol: currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.REGULAR]: {
      nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
      fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.REGULAR))
        .times(nativeVal!)
        .toString(),
      nativeSymbol: currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FAST]: {
      nativeValue: getConvertedVal(GasPriceTypes.FAST),
      fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST))
        .times(nativeVal!)
        .toString(),
      nativeSymbol: currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FASTEST]: {
      nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
      fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FASTEST))
        .times(nativeVal!)
        .toString(),
      nativeSymbol: currencyName,
      fiatSymbol: "USD",
    },
  };
  return gasCostValues;
};
export { isAddress, getGasCostValues };
