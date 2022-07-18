import { BaseToken } from "@/types/base-token";
import EvmAPI from "@/providers/ethereum/libs/api";
import SubstrateAPI from "@/providers/polkadot/libs/api";
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

export type Trade = { transactions: TransactionInfo[]; dex: string };

export enum TradeStatus {
  PENDING,
  FAILED,
  COMPLETED,
  UNKNOWN,
}

export abstract class SwapProvider {
  public abstract supportedDexes: string[];
  public abstract supportedNetworks: string[];

  public isSupportedNetwork(chainName: string): boolean {
    return this.supportedNetworks.includes(chainName);
  }

  public abstract isValidAddress(address: string): boolean;

  public abstract getSupportedTokens(chain: string): Promise<BaseToken[]>;

  public abstract getMinMaxAmount(
    fromToken: BaseToken,
    toToken?: BaseToken
  ): Promise<{
    min: string;
    max: string;
  }>;

  public abstract getQuote(
    chain: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<QuoteInfo[]>;

  public abstract getTrade(
    chain: string,
    fromAddress: string,
    toAddress: string,
    quote: QuoteInfo,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<Trade>;

  public abstract getStatus(statusOject: any, web3: Web3): TradeStatus;

  public abstract executeTrade(
    api: EvmAPI | SubstrateAPI,
    trade: Trade,
    confirmInfo: any
  ): Promise<void>;
}
