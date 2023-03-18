import { NetworkNames } from "@enkryptcom/types";
import type { toBN } from "web3-utils";
import type Web3Eth from "web3-eth";

export interface TokenType {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  logoURI: string;
  rank?: number;
  cgId?: string;
}

export interface TokenNetworkType {
  network: NetworkNames | string;
  isAddress: (addr: string) => boolean;
}
export interface TokenTypeTo extends TokenType {
  networks: TokenNetworkType[];
}

export interface FromTokenType {
  top: TokenType[];
  trending: TokenType[];
  all: TokenType[];
}

export interface ToTokenType {
  top: TokenTypeTo[];
  trending: TokenTypeTo[];
  all: TokenTypeTo[];
}

export type BN = ReturnType<typeof toBN>;

export interface EvmOptions {
  infiniteApproval: boolean;
}

// eslint-disable-next-line no-shadow
export enum WalletIdentifier {
  enkrypt = "enkrypt",
  mew = "mew",
}

export type APIType = Web3Eth;

export interface QuoteMetaOptions {
  infiniteApproval: boolean;
  walletIdentifier: WalletIdentifier;
  slippage?: string;
}

export interface SwapOptions {
  network: NetworkNames;
  api: APIType;
  evmOptions?: EvmOptions;
  walletIdentifier: WalletIdentifier;
}

// eslint-disable-next-line no-shadow
export enum ProviderName {
  oneInch = "oneInch",
  paraswap = "paraswap",
  zerox = "zerox",
  changelly = "changelly",
}

export interface getQuoteOptions {
  fromAddress: string;
  amount: BN;
  fromToken: TokenType;
  toToken: TokenType;
  fromNetwork: NetworkNames;
  toNetwork: NetworkNames | string;
}

export interface EVMTransaction {
  gasLimit: string;
  to: string;
  value: string;
  data: string;
}

export interface ProviderQuoteResponce {
  transactions: EVMTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
}
