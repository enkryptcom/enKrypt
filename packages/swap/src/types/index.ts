import { NetworkNames, SignerType } from "@enkryptcom/types";
import type { toBN } from "web3-utils";
import type Web3Eth from "web3-eth";
import type { Connection as Web3Solana } from "@solana/web3.js";

// eslint-disable-next-line no-shadow
export enum Events {
  QuoteUpdate = "quote-update",
}

// eslint-disable-next-line no-shadow
export enum SupportedNetworkName {
  Ethereum = NetworkNames.Ethereum,
  Binance = NetworkNames.Binance,
  Litecoin = NetworkNames.Litecoin,
  Dogecoin = NetworkNames.Dogecoin,
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
  Kaia = NetworkNames.Kaia,
  Aurora = NetworkNames.Aurora,
  Zksync = NetworkNames.ZkSync,
  Base = NetworkNames.Base,
  MaticZK = NetworkNames.MaticZK,
  Blast = NetworkNames.Blast,
  Telos = NetworkNames.Telos,
  Rootstock = NetworkNames.Rootstock,
  Solana = NetworkNames.Solana,
}

// eslint-disable-next-line no-shadow
export enum NetworkType {
  EVM = "evm",
  Substrate = "substrate",
  Bitcoin = "bitcoin",
  Solana = "solana",
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

// Web3 (for EVM) or Connection (for Solana)
export type APIType = Web3Eth | Web3Solana;

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
  rango = "rango",
  jupiter = "jupiter",
}

// eslint-disable-next-line no-shadow
export enum TransactionStatus {
  pending = "pending",
  failed = "failed",
  success = "success",
  dropped = "dropped",
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
  solana = "solana",
}

export interface EVMTransaction {
  from: string;
  gasLimit: string;
  to: string;
  value: string;
  data: string;
  type: TransactionType.evm;
}

export interface SolanaTransaction {
  from: string;
  /** TODO: document what this is for, I think it's just for UI */
  to: string;
  kind: "legacy" | "versioned";
  /** base64 serialized unsigned solana transaction */
  serialized: string;
  type: TransactionType.solana;
  /**
   * Signatures from swap providers (Rango) so they can verify we haven't tampered with the transaction
   *
   * If the transaction has signatures then we can't modify the transaction without invalidating the signatures
   */
  thirdPartySignatures: {
    /** Base58 */
    pubkey: string;
    /** uint8 byte array */
    signature: number[];
  }[];
}

export interface GenericTransaction {
  from: string;
  to: string;
  value: string;
  type: TransactionType.generic;
}

export type SwapTransaction =
  | EVMTransaction
  | GenericTransaction
  | SolanaTransaction;

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
  /**
   * Additional native currency that has to be paid for the transaction
   * For example Changelly bridging fees, Solana rent fees
   */
  additionalNativeFees: BN;
  provider: ProviderName;
  quote: SwapQuote;
  minMax: MinMaxResponse;
}

export type StatusOptionTransaction = {
  /** Transaction hash */
  hash: string;
  /** Unix epoch milliseconds `Date.now()` */
  sentAt: number;
};

export interface StatusOptions {
  [key: string]: any;
  transactions: StatusOptionTransaction[];
}

export interface StatusOptionsResponse {
  options: StatusOptions;
  provider: ProviderName;
}

export interface ProviderSwapResponse {
  transactions: SwapTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
  /**
   * Additional native currency that has to be paid for the transaction
   * For example Changelly bridging fees, Solana rent fees
   */
  additionalNativeFees: BN;
  provider: ProviderName;
  slippage: string;
  /** Percentage fee 0-1 (100 * basis points) */
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

  abstract network: SupportedNetworkName;

  abstract init(tokenList: TokenType[]): Promise<void>;

  abstract getFromTokens(): ProviderFromTokenResponse;

  abstract getToTokens(): ProviderToTokenResponse;

  abstract getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderQuoteResponse | null>;

  abstract getSwap(
    quote: SwapQuote,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderSwapResponse | null>;

  abstract getStatus(options: StatusOptions): Promise<TransactionStatus>;
}
