import { GasPriceTypes } from "@/providers/common/types";
import { BaseNetwork } from "@/types/base-network";
import {
  EVMTransaction,
  GenericTransaction,
  NetworkType,
  ProviderSwapResponse,
  TokenType,
  TokenTypeTo,
  StatusOptionsResponse,
} from "@enkryptcom/swap";
import { EnkryptAccount } from "@enkryptcom/types";
import { BN } from "ethereumjs-util";
export enum SWAP_LOADING {
  LOADING = "loading",
  LOOKING_FOR_OFFERS = "looking",
}

export interface SwapData {
  trades: ProviderResponseWithStatus[];
  fromToken: TokenType;
  toToken: TokenTypeTo;
  priceDifference: string;
  nativeBalance: BN;
  nativePrice: number;
  existentialDeposit: BN;
  fromAddress: string;
  toAddress: string;
}

export interface ProviderResponseWithStatus extends ProviderSwapResponse {
  status?: StatusOptionsResponse;
}

export enum SwapBestOfferWarnings {
  BAD_PRICE = 0,
  NOT_ENOUGH_GAS,
  EXISTENTIAL_DEPOSIT,
  NONE,
}

export type TransactionType = EVMTransaction | GenericTransaction;

export interface ExecuteSwapOptions {
  from: EnkryptAccount;
  fromToken: TokenType;
  toToken: TokenTypeTo;
  networkType: NetworkType;
  network: BaseNetwork;
  gasPriceType: GasPriceTypes;
  swap: ProviderSwapResponse;
}
