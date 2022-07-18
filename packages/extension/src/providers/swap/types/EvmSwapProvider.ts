import { toBase } from "@/libs/utils/units";
import API from "@/providers/ethereum/libs/api";
import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { BaseToken } from "@/types/base-token";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { isAddress } from "web3-utils";
import {
  Quote,
  QuoteInfo,
  SwapProvider,
  TokenData,
  Trade,
  TradeStatus,
  TransactionInfo,
} from "./SwapProvider";

const HOST_URL = "https://mainnet.mewwallet.dev/v3";
const REQUEST_CACHER = "https://requestcache.mewapi.io/?url=";
const GET_LIST = "/swap/list";
const GET_QUOTE = "/swap/quote";
const GET_TRADE = "/swap/trade";

export class EvmSwapProvider extends SwapProvider {
  public supportedDexes = ["ZERO_X", "ONE_INCH", "PARASWAP"];
  public supportedNetworks: string[] = [];
  // public providerName: string;

  constructor() {
    super();
    // this.providerName = providerName;
  }

  public isValidAddress(address: string): boolean {
    return isAddress(address);
  }

  public async getSupportedTokens(chain: string): Promise<Erc20Token[]> {
    try {
      const res = await fetch(
        `${REQUEST_CACHER}${HOST_URL}${GET_LIST}?chain=${chain}`
      );

      const data: TokenData[] = await res.json();

      return data.map((tokenData: TokenData) => {
        return new Erc20Token({
          decimals: tokenData.decimals,
          contract: tokenData.contract_address,
          icon: tokenData.icon && tokenData.icon !== "" ? tokenData.icon : "",
          symbol: tokenData.symbol,
          name: tokenData.name ?? tokenData.symbol,
          price: tokenData.price,
          balance: toBase("1", tokenData.decimals),
        });
      });
    } catch {
      throw new Error("Could not fetch tokens");
    }
  }

  public getMinMaxAmount(fromToken: BaseToken): Promise<{
    min: string;
    max: string;
  }> {
    return Promise.resolve({
      min: new BigNumber(1)
        .dividedBy(new BigNumber(10).pow(fromToken.decimals))
        .toFixed(),
      max: new BigNumber(1)
        .multipliedBy(new BigNumber(10).pow(fromToken.decimals))
        .toFixed(),
    });
  }

  public async getQuote(
    chain: string,
    fromToken: Erc20Token,
    toToken: Erc20Token,
    fromAmount: string
  ): Promise<QuoteInfo[]> {
    if (!isAddress(fromToken.contract) || !isAddress(toToken.contract))
      return [];
    const params = new URLSearchParams();
    params.append("fromContractAddress", fromToken.contract);
    params.append("toContractAddress", toToken.contract);
    params.append("amount", fromAmount);
    params.append("chain", chain);

    const { min, max } = await this.getMinMaxAmount(fromToken);

    try {
      const res = await fetch(`${HOST_URL}${GET_QUOTE}?${params.toString()}`);

      const { quotes }: { quotes: Quote[] } = await res.json();

      return quotes.map(({ exchange, amount, dex }) => {
        return {
          exchange,
          min,
          max,
          amount,
          dex,
        };
      });
    } catch {
      throw new Error("Could not retrieve pairs");
    }

    return [];
  }

  public async getTrade(
    chain: string,
    fromAddress: string,
    toAddress: string,
    quote: QuoteInfo,
    fromToken: Erc20Token,
    toToken: Erc20Token,
    fromAmount: string
  ): Promise<Trade> {
    try {
      const params = new URLSearchParams();
      params.append("address", fromAddress);
      params.append("recipient", toAddress);
      params.append("dex", quote.dex); // this.provider
      params.append("exchange", quote.exchange);
      params.append("platform", "web");
      params.append("fromContractAddress", fromToken.contract);
      params.append("toContractAddress", toToken.contract);
      params.append("amount", fromAmount);
      params.append("chain", chain);

      console.log(`${HOST_URL}${GET_TRADE}?${params.toString()}`);
      const res = await fetch(`${HOST_URL}${GET_TRADE}?${params.toString()}`);

      const data: { transactions: TransactionInfo[] } = await res.json();

      console.log(data.transactions);
      return { transactions: data.transactions, dex: quote.dex };
    } catch {
      throw new Error("Could not retrieve trades");
    }
  }

  public getStatus(statusObject: any, web3: Web3): TradeStatus {
    const hashes: string[] = statusObject.hashes;

    const promises = hashes.map((hash: string) =>
      web3.eth.getTransactionReceipt(hash).then((receipt) => {
        return {
          isPending: !receipt || (receipt && !receipt.blockNumber),
          isSuccess: receipt && receipt.status,
        };
      })
    );

    return TradeStatus.COMPLETED;
    // return Promise.all(promises)
  }

  public async executeTrade(
    api: API,
    trade: Trade,
    confirmInfo: any
  ): Promise<void> {
    // trade.transactions[0].
    return;
  }
}
