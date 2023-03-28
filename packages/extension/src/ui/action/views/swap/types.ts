import { ProviderSwapResponse, TokenType, TokenTypeTo } from "@enkryptcom/swap";
import { BN } from "ethereumjs-util";
export enum SWAP_LOADING {
  LOADING = "loading",
  LOOKING_FOR_OFFERS = "looking",
}

export interface SwapData {
  trades: ProviderSwapResponse[];
  fromToken: TokenType;
  toToken: TokenTypeTo;
  priceDifference: string;
  swapMax: boolean;
  nativeBalance: BN;
  nativePrice: number;
  existentialDeposit: BN;
  fromAddress: string;
}

export enum SwapBestOfferWarnings {
  BAD_PRICE = 0,
  NOT_ENOUGH_GAS,
  EXISTENTIAL_DEPOSIT,
  NONE,
}
