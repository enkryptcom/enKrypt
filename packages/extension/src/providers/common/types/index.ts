import type { toBN } from 'web3-utils';

export interface GasFeeInfo {
  nativeValue: string;
  fiatValue: string;
  nativeSymbol: string;
  fiatSymbol: string;
}
export enum GasPriceTypes {
  ECONOMY = 'ECONOMY',
  REGULAR = 'REGULAR',
  FAST = 'FAST',
  FASTEST = 'FASTEST',
}
export interface GasFeeType {
  [GasPriceTypes.ECONOMY]: GasFeeInfo;
  [GasPriceTypes.REGULAR]: GasFeeInfo;
  [GasPriceTypes.FAST]: GasFeeInfo;
  [GasPriceTypes.FASTEST]: GasFeeInfo;
}

export type BNType = ReturnType<typeof toBN>;
