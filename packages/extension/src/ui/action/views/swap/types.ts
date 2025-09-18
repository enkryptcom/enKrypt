import { BNType, GasPriceTypes } from '@/providers/common/types';
import { BaseNetwork } from '@/types/base-network';
import {
  EVMTransaction,
  GenericTransaction,
  NetworkType,
  ProviderSwapResponse,
  TokenType,
  TokenTypeTo,
  StatusOptionsResponse,
  SolanaTransaction,
} from '@enkryptcom/swap';
import { RFQOptionsResponse } from '@enkryptcom/swap/src/types';
import { EnkryptAccount } from '@enkryptcom/types';
export enum SWAP_LOADING {
  LOADING = 'loading',
  LOOKING_FOR_OFFERS = 'looking',
}

export interface SwapData {
  trades: ProviderResponseWithStatus[];
  fromToken: TokenType;
  toToken: TokenTypeTo;
  priceDifference: string;
  nativeBalance: BNType;
  nativePrice: number;
  existentialDeposit: BNType;
  fromAddress: string;
  toAddress: string;
}

export interface ProviderResponseWithStatus extends ProviderSwapResponse {
  status?: StatusOptionsResponse;
  rfqOptions?: RFQOptionsResponse;
}

export enum SwapBestOfferWarnings {
  BAD_PRICE = 0,
  NOT_ENOUGH_GAS,
  EXISTENTIAL_DEPOSIT,
  NONE,
}

export type TransactionType =
  | EVMTransaction
  | GenericTransaction
  | SolanaTransaction;

export interface ExecuteSwapOptions {
  from: EnkryptAccount;
  fromToken: TokenType;
  toToken: TokenTypeTo;
  networkType: NetworkType;
  network: BaseNetwork;
  gasPriceType: GasPriceTypes;
  swap: ProviderSwapResponse;
}
