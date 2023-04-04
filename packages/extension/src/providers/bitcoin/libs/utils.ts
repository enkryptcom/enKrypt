import { BitcoinNetworkInfo } from "../types";
import { address as BTCAddress } from "bitcoinjs-lib";
import { GasPriceTypes } from "@/providers/common/types";
import { fromBase } from "@enkryptcom/utils";
import BigNumber from "bignumber.js";
import { BitcoinNetwork } from "../types/bitcoin-network";

const isAddress = (address: string, network: BitcoinNetworkInfo): boolean => {
  try {
    BTCAddress.toOutputScript(address, network);
    return true;
  } catch {
    return false;
  }
};
const getGasCostValues = async (
  network: BitcoinNetwork,
  byteSize: number,
  nativeVal = "0",
  decimals: number,
  currencyName: string
) => {
  const fees = await network.feeHandler();
  const gasVals = {
    [GasPriceTypes.FASTEST]: (byteSize * fees.FASTEST).toString(),
    [GasPriceTypes.FAST]: (byteSize * fees.FAST).toString(),
    [GasPriceTypes.REGULAR]: (byteSize * fees.REGULAR).toString(),
    [GasPriceTypes.ECONOMY]: (byteSize * fees.ECONOMY).toString(),
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
