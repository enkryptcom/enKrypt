import { BaseToken } from "@/types/base-token";
import { EvmSwapProvider, ChangellySwapProvider } from "./types";
import {
  QuoteInfo,
  Rates,
  SwapProvider,
  TradeInfo,
  TradePreview,
} from "./types/SwapProvider";
import { BaseNetwork } from "@/types/base-network";
import { EnkryptAccount } from "@enkryptcom/types";
import BigNumber from "bignumber.js";

export class Swap {
  public providers: SwapProvider[] = [
    new EvmSwapProvider(),
    new ChangellySwapProvider(),
  ];

  public async getAllTokens(chain: string): Promise<BaseToken[]> {
    return Promise.all(
      this.providers
        .filter((provider) => provider.isSupportedNetwork(chain))
        .map((provider) =>
          provider.getSupportedTokens(chain).catch((error) => {
            console.error(error);
            return [];
          })
        )
    ).then((tokens) => tokens.flat());
  }

  public async getAllQuotes(
    chain: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<QuoteInfo[]> {
    return Promise.all(
      this.providers
        .filter((provider) => provider.isSupportedNetwork(chain))
        .map((provider) =>
          provider
            .getQuote(chain, fromToken, toToken, fromAmount)
            .then((quoteInfo) => quoteInfo)
            .catch((error) => {
              console.error(error);
              return [];
            })
        )
    ).then((quotes) => quotes.flat());
  }

  public async getTradePreview(
    chain: string,
    fromToken: BaseToken,
    toToken: BaseToken
  ): Promise<TradePreview | null> {
    const previews = await Promise.all(
      this.providers
        .filter((provider) => provider.isSupportedNetwork(chain))
        .map((provider) => provider.getTradePreview(chain, fromToken, toToken))
    );

    let min: string | null = null;
    let max: string | null = null;
    let rates: Rates = [];

    previews.forEach((preview) => {
      if (preview) {
        if (min === null || new BigNumber(preview.min).lt(min)) {
          min = preview.min;
        }

        if (max === null || new BigNumber(preview.max).gt(max)) {
          max = preview.max;
        }

        rates = rates.concat(preview.rates);
      }
    });

    if (min !== null && max !== null) {
      return {
        min,
        max,
        rates,
      };
    } else {
      return null;
    }
  }

  public async getTrade(
    chain: string,
    fromAddress: string,
    toAddress: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<TradeInfo[]> {
    return Promise.all(
      this.providers
        .filter((provider) => provider.isSupportedNetwork(chain))
        .map((provider) =>
          provider.getTrade(
            chain,
            fromAddress,
            toAddress,
            fromToken,
            toToken,
            fromAmount
          )
        )
    ).then((trades) => trades.flat());
  }

  public async executeTrade(
    network: BaseNetwork,
    fromAccount: EnkryptAccount,
    trade: TradeInfo,
    confirmInfo: any
  ): Promise<`0x${string}`[]> {
    const provider = this.providers.find((provider) =>
      provider.supportedDexes.includes(trade.provider)
    );

    if (!provider) {
      return ["0x"];
    }

    return provider.executeTrade(network, fromAccount, trade, confirmInfo);
  }
}
