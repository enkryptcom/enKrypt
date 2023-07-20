import { NetworkNames, SignerType } from "@enkryptcom/types";
import type { toBN } from "web3-utils";
import type Web3Eth from "web3-eth";

// eslint-disable-next-line no-shadow
export enum Events {
  QuoteUpdate = "quote-update",
}

// eslint-disable-next-line no-shadow
export enum SupportedNetworkName {
  Ethereum = NetworkNames.Ethereum,
  Binance = NetworkNames.Binance,
  Matic = NetworkNames.Matic,
  Optimism = NetworkNames.Optimism,
  Polkadot = NetworkNames.Polkadot,
  Kusama = NetworkNames.Kusama,
  Bitcoin = NetworkNames.Bitcoin,
  EthereumClassic = NetworkNames.EthereumClassic,
  Moonbeam = NetworkNames.Moonbeam,
  Arbitrum = NetworkNames.Arbitrum,
  Gnosis = NetworkNames.Gnosis,
  Avalanche = NetworkNames.Avalanche,
  Fantom = NetworkNames.Fantom,
  Klaytn = NetworkNames.Klaytn,
  Aurora = NetworkNames.Aurora,
}

// eslint-disable-next-line no-shadow
export enum NetworkType {
  EVM = "evm",
  Substrate = "substrate",
  Bitcoin = "bitcoin",
}

export type BN = ReturnType<typeof toBN>;

export interface TokenType {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  logoURI: string;
  type: NetworkType;
  rank?: number;
  cgId?: string;
  balance?: BN;
  price?: number;
}

export interface NetworkInfo {
  id: SupportedNetworkName;
  symbol: string;
  decimals: number;
  name: string;
  logoURI: string;
  rank: number;
  cgId: string;
  type: NetworkType;
  signerType: SignerType[];
}

export interface TokenNetworkType {
  name: SupportedNetworkName | string;
  isAddress: (addr: string) => Promise<boolean>;
}
export interface TokenTypeTo extends TokenType {
  networkInfo: TokenNetworkType;
}

export interface FromTokenType {
  top: TokenType[];
  trending: TokenType[];
  all: TokenType[];
}

export interface ToTokenType {
  top: Record<SupportedNetworkName, TokenTypeTo[]> | Record<string, never>;
  trending: Record<SupportedNetworkName, TokenTypeTo[]> | Record<string, never>;
  all: Record<SupportedNetworkName, TokenTypeTo[]> | Record<string, never>;
}

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
  changellyQuoteId?: string;
  changellynetworkFee?: BN;
  priceRoute?: unknown;
}

export interface SwapOptions {
  network: SupportedNetworkName;
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

// eslint-disable-next-line no-shadow
export enum TransactionStatus {
  pending = "pending",
  failed = "failed",
  success = "success",
}

export interface getQuoteOptions {
  fromAddress: string;
  toAddress: string;
  amount: BN;
  fromToken: TokenType;
  toToken: TokenTypeTo;
}

// eslint-disable-next-line no-shadow
export enum TransactionType {
  evm = "evm",
  generic = "generic",
}

export interface EVMTransaction {
  from: string;
  gasLimit: string;
  to: string;
  value: string;
  data: string;
  type: TransactionType.evm;
}

export interface GenericTransaction {
  from: string;
  to: string;
  value: string;
  type: TransactionType.generic;
}

export type SwapTransaction = EVMTransaction | GenericTransaction;

export interface MinMaxResponse {
  minimumFrom: BN;
  maximumFrom: BN;
  minimumTo: BN;
  maximumTo: BN;
}

export interface SwapQuote {
  options: getQuoteOptions;
  meta: QuoteMetaOptions;
  provider: ProviderName;
}

export interface ProviderQuoteResponse {
  toTokenAmount: BN;
  fromTokenAmount: BN;
  totalGaslimit: number;
  provider: ProviderName;
  quote: SwapQuote;
  minMax: MinMaxResponse;
}
export interface StatusOptions {
  [key: string]: any;
  transactionHashes: string[];
}

export interface StatusOptionsResponse {
  options: StatusOptions;
  provider: ProviderName;
}

export interface ProviderSwapResponse {
  transactions: SwapTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
  provider: ProviderName;
  slippage: string;
  fee: number;
  getStatusObject: (options: StatusOptions) => Promise<StatusOptionsResponse>;
}

export type ProviderFromTokenResponse = Record<string, TokenType>;

export type ProviderToTokenResponse =
  | Record<SupportedNetworkName, Record<string, TokenTypeTo>>
  | Record<string, never>;

export interface TopTokenInfo {
  trendingTokens: Record<string, number>;
  topTokens: Record<
    string,
    {
      rank: number;
      price: number;
    }
  >;
  contractsToId: Record<string, string>;
}

export abstract class ProviderClass {
  abstract name: string;

  network: SupportedNetworkName;

  constructor(_web3eth: Web3Eth, network: SupportedNetworkName) {
    this.network = network;
  }

  abstract init(tokenList: TokenType[]): Promise<void>;

  abstract getFromTokens(): ProviderFromTokenResponse;

  abstract getToTokens(): ProviderToTokenResponse;

  abstract getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null>;

  abstract getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null>;

  abstract getStatus(options: StatusOptions): Promise<TransactionStatus>;
}
