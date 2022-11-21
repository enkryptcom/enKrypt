import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import Web3Eth from "web3-eth";
import { BaseNetwork } from "@/types/base-network";
import { EnkryptAccount, NetworkNames } from "@enkryptcom/types";
import { GasPriceTypes } from "@/providers/common/types";

export type Rates = Array<{ amount: string; rate: string }>;

export type TradePreview = {
  min: string;
  max: string;
  rates: Rates;
};

export type Quote = {
  dex: string;
  exchange: string;
  amount: string;
  rank: number;
};

export type QuoteInfo = {
  exchange: string;
  min: string;
  max: string;
  amount: string;
  dex: string;
  rateId?: string;
};

export type TokenData = {
  contract_address: string;
  price: string;
  volume_24h: string;
  name: string;
  symbol: string;
  icon: string;
  icon_png: string;
  decimals: number;
  timestamp: string;
};

export type TransactionInfo = {
  from: string;
  to: string;
  tokenValue: string;
  token: BaseTokenOptions;
  data: `0x${string}`;
  value: `0x${string}`;
  gas?: `0x${string}`;
};

export type TradeInfo = {
  provider: string;
  fromAmount: string;
  minimumReceived: string;
  maxSlippage?: string;
  priceImpact?: string;
  fee: string;
  gas: string;
  rateId?: string;
  txs: TransactionInfo[];
};

export type Trade = { transactions: TransactionInfo[]; dex: string };

export enum TradeStatus {
  PENDING,
  FAILED,
  COMPLETED,
  UNKNOWN,
}

export abstract class SwapProvider {
  public abstract supportedDexes: string[];
  public abstract supportedNetworks: NetworkNames[];

  public isSupportedNetwork(chainName: NetworkNames): boolean {
    return this.supportedNetworks.includes(chainName);
  }

  public abstract isValidAddress(
    address: string,
    toToken: BaseToken
  ): Promise<boolean>;

  public abstract getSupportedTokens(
    chainName: NetworkNames
  ): Promise<{ tokens: BaseToken[]; featured: BaseToken[] }>;

  public abstract getMinMaxAmount(
    fromToken: BaseToken,
    toToken?: BaseToken
  ): Promise<{
    min: string;
    max: string;
  }>;

  public abstract getTradePreview(
    chainName: NetworkNames,
    fromToken: BaseToken,
    toToken: BaseToken
  ): Promise<TradePreview | null>;

  public abstract getQuote(
    chainName: NetworkNames,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<QuoteInfo[]>;

  public abstract getTrade(
    chainName: NetworkNames,
    fromAddress: string,
    toAddress: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string,
    isMax: boolean
  ): Promise<TradeInfo[]>;

  public abstract getStatus(statusOject: any, web3: Web3Eth): TradeStatus;

  public abstract executeTrade(
    network: BaseNetwork,
    fromAccount: EnkryptAccount,
    trade: TradeInfo,
    gasPriceType?: GasPriceTypes
  ): Promise<`0x${string}`[]>;
}
