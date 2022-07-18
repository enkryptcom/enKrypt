import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { BaseToken } from "@/types/base-token";
import { UnknownToken } from "@/types/unknown-token";
import BigNumber from "bignumber.js";
import types from "web3";
import EvmAPI from "@/providers/ethereum/libs/api";
import SubstrateAPI from "@/providers/polkadot/libs/api";
import {
  Quote,
  QuoteInfo,
  SwapProvider,
  Trade,
  TradeStatus,
} from "./SwapProvider";

interface ChangellyTokenInfo {
  contractAddress?: string;
  fullName: string;
  ticker: string;
  fixRateEnabled: boolean;
  coingeckoID?: string;
  image: string;
  price?: string;
}

const HOST_URL = "https://swap.mewapi.io/changelly";
const REQUEST_CACHER = "https://requestcache.mewapi.io/?url=";

export class ChangellySwapProvider extends SwapProvider {
  public supportedNetworks: string[] = [];
  public supportedDexes = ["CHANGELLY"];
  constructor() {
    super();
  }

  public isValidAddress(address: string): boolean {
    return false;
  }

  public async getSupportedTokens(): Promise<BaseToken[]> {
    try {
      const res = await fetch(`${REQUEST_CACHER}${HOST_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "1",
          jsonrpc: "2.0",
          method: "getCurrenciesFull",
          params: {},
        }),
      });

      const data = await res.json();

      const tokenData = (data.result as ChangellyTokenInfo[])
        .filter((tokenData) => tokenData.fixRateEnabled)
        .map((tokenData) => {
          const coingeckoID = tokenData.fullName
            .toLowerCase()
            .split(" ")
            .join("-");
          return { coingeckoID, ...tokenData };
        });

      const coingeckoIDs = tokenData
        .map(({ coingeckoID }) => [coingeckoID])
        .join(",");

      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append("ids", coingeckoIDs);
      urlSearchParams.append("vs_currencies", "usd");

      const pricesRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?${urlSearchParams.toString()}`
      );

      const prices = await pricesRes.json();

      Object.keys(prices).forEach((cgid) => {
        const token = tokenData.find((token) => token.coingeckoID === cgid);

        if (token) {
          token.price = prices[cgid]["usd"];
        }
      });

      return tokenData.map((tokenData) => {
        const tokenOptions = {
          name: tokenData.fullName,
          symbol: tokenData.ticker,
          decimals: 0,
          icon: tokenData.image,
          balance: "1",
          price: tokenData.price,
        };

        if (tokenData.contractAddress) {
          return new Erc20Token({
            contract: tokenData.contractAddress,
            ...tokenOptions,
          });
        } else {
          return new UnknownToken(tokenOptions);
        }
      });
    } catch (error) {
      throw new Error(`Could not fetch tokens, ${error}`);
    }
  }

  public async getMinMaxAmount(
    fromToken: BaseToken,
    toToken: BaseToken
  ): Promise<{ min: string; max: string }> {
    const res = await fetch(`${HOST_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "1",
        jsonrpc: "2.0",
        method: "getFixRate",
        params: [
          {
            from: fromToken.symbol.toLowerCase(),
            to: toToken.symbol.toLowerCase(),
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error("Could not get min max");
    }

    const data = await res.json();

    return {
      min: data.result[0].minFrom,
      max: data.result[0].maxFrom,
    };
  }

  public async getQuote(
    chain: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<QuoteInfo[]> {
    const fromAmountBN = new BigNumber(fromAmount);

    try {
      const minmax = await this.getMinMaxAmount(fromToken, toToken);
      if (!minmax || (minmax && (!minmax.min || !minmax.max))) {
        return [];
      }

      const res = await fetch(`${HOST_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "1",
          jsonrpc: "2.0",
          method: "getFixRateForAmount",
          params: [
            {
              from: fromToken.symbol.toLowerCase(),
              to: toToken.symbol.toLowerCase(),
              amountFrom: fromAmount,
            },
          ],
        }),
      });

      if (!res.ok) {
        console.error(res.status, res.statusText);
        throw new Error("Could not get quote");
      }

      const data = await res.json();

      return [
        {
          exchange: "changelly",
          dex: "changelly",
          min: minmax!.min,
          max: minmax!.max,
          amount: data.result[0].result === 0 ? "0" : data.result[0].amountTo,
          rateId: data.result[0].result === 0 ? "" : data.result[0].id,
        },
      ];
    } catch (error) {
      console.error(error);
      throw new Error("Could not get quote");
    }
  }

  public async getTrade(
    chain: string,
    fromAddress: string,
    toAddress: string,
    quote: QuoteInfo,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<Trade> {
    return { transactions: [], dex: "changelly" };
  }

  public getStatus(statusOject: any, web3: types): TradeStatus {
    return TradeStatus.UNKNOWN;
  }

  public async executeTrade(
    api: EvmAPI | SubstrateAPI,
    trade: Trade,
    confirmInfo: any
  ): Promise<void> {
    return;
  }
}
