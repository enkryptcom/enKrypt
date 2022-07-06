import { GasPriceTypes } from "../../libs/transaction/types";

const defaultGasCostVals = {
  [GasPriceTypes.ECONOMY]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "ETH",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.REGULAR]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "ETH",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.FAST]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "ETH",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.FASTEST]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "ETH",
    fiatSymbol: "USD",
  },
};
export { defaultGasCostVals };
