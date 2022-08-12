import { GasPriceTypes } from "../types";

const defaultGasCostVals = {
  [GasPriceTypes.ECONOMY]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "~",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.REGULAR]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "~",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.FAST]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "~",
    fiatSymbol: "USD",
  },
  [GasPriceTypes.FASTEST]: {
    nativeValue: "0",
    fiatValue: "0.00",
    nativeSymbol: "~",
    fiatSymbol: "USD",
  },
};
export { defaultGasCostVals };
