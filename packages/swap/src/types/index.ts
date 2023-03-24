import { NetworkNames } from "@enkryptcom/types";
import type { toBN } from "web3-utils";
import type Web3Eth from "web3-eth";
import { SignerType } from "@enkryptcom/types";

// eslint-disable-next-line no-shadow
export enum NewNetworks {
  Arbitrum = "ARB",
  Gnosis = "GNO",
  Avalanche = "AVAX",
  Fantom = "FTM",
  Klaytn = "KLAY",
  Aurora = "AURORA",
}

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
  Arbitrum = NewNetworks.Arbitrum,
  Gnosis = NewNetworks.Gnosis,
  Avalanche = NewNetworks.Avalanche,
  Fantom = NewNetworks.Fantom,
  Klaytn = NewNetworks.Klaytn,
  Aurora = NewNetworks.Aurora,
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
  top: Record<SupportedNetworkName, TokenTypeTo[]>;
  trending: Record<SupportedNetworkName, TokenTypeTo[]>;
  all: Record<SupportedNetworkName, TokenTypeTo[]>;
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
  gasLimit: string;
  to: string;
  value: string;
  data: string;
  type: TransactionType.evm;
}

export interface GenericTransaction {
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

export interface ProviderSwapResponse {
  transactions: SwapTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
  provider: ProviderName;
  getStatusObject: (options: unknown) => Promise<unknown>;
}

export type ProviderFromTokenResponse = Record<string, TokenType>;

export type ProviderToTokenResponse = Record<
  SupportedNetworkName,
  Record<string, TokenTypeTo>
>;

export interface StatusOptions {
  transactionHashes: string[];
}

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

  abstract getStatus(options: unknown): Promise<TransactionStatus>;
}
