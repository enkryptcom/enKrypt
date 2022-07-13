import { BaseToken } from "@/types/base-token";
import Web3 from "web3";

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
};

export type TokenData = {
  contract_address: string;
  price: string;
  volume_24h: string;
  name: string;
  symbol: string;
  icon: string;
  icon_png: string;
  decimals: 6;
  timestamp: string;
};

export type TransactionInfo = {
  to: string;
  from: string;
  data: `0x{string}`;
  value: `0x{string}`;
  gas: `0x{string}`;
};

export type Trade = { transactions: TransactionInfo[] };

export enum TradeStatus {
  PENDING,
  FAILED,
  COMPLETED,
  UNKNOWN,
}

export abstract class SwapProvider {
  // public abstract providerName: string;
  public abstract supportedNetworks: string[];

  public isSupportedNetwork(chainName: string): boolean {
    return this.supportedNetworks.includes(chainName);
  }

  public abstract isValidAddress(address: string): boolean;

  public abstract getSupportedTokens(chain: string): Promise<BaseToken[]>;

  public abstract getMinMaxAmount(fromToken: BaseToken): {
    min: string;
    max: string;
  };

  public abstract getQuote(
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<QuoteInfo[]>;

  public abstract getTrade(
    fromAddress: string,
    toAddress: string,
    quote: Quote,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<Trade>;

  public abstract getStatus(statusOject: any, web3: Web3): TradeStatus;

  public abstract executeTrade(trade: Trade, confirmInfo: any): Promise<void>;
}
