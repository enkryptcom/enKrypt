import { GasPriceTypes } from "../libs/transaction/types";

export interface GasFeeInfo {
  nativeValue: string;
  fiatValue: string;
  nativeSymbol: string;
  fiatSymbol: string;
}
export interface GasFeeType {
  [GasPriceTypes.ECONOMY]: GasFeeInfo;
  [GasPriceTypes.REGULAR]: GasFeeInfo;
  [GasPriceTypes.FAST]: GasFeeInfo;
  [GasPriceTypes.FASTEST]: GasFeeInfo;
}
