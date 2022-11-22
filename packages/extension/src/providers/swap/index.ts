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
import { EnkryptAccount, NetworkNames } from "@enkryptcom/types";
import BigNumber from "bignumber.js";
import { GasPriceTypes } from "@/providers/common/types";
import { ChangellyToken } from "./types/changelly-token";

export class Swap {
  public providers: SwapProvider[] = [
    new EvmSwapProvider(),
    new ChangellySwapProvider(),
  ];

  public getSupportedNetworks(): NetworkNames[] {
    return this.providers.map((provider) => provider.supportedNetworks).flat();
  }

  public async isValidAddress(
    address: string,
    toToken: BaseToken
  ): Promise<boolean> {
    if ((toToken as ChangellyToken).changellyID) {
      const changelly = this.providers.find((provider) =>
        provider.supportedDexes.includes("CHANGELLY")
      );

      if (changelly) {
        return changelly.isValidAddress(address, toToken);
      } else {
        return false;
      }
    }

    const promises = this.providers
      .filter((provider) => !provider.supportedDexes.includes("CHANGELLY"))
      .map((provider) => provider.isValidAddress(address, toToken));

    return Promise.all(promises).then((validations) =>
      validations.reduce((a, b) => {
        if (a !== undefined) {
          return a || b;
        } else {
          return b;
        }
      })
    );
  }

  public async getAllTokens(
    chain: NetworkNames
  ): Promise<{ tokens: BaseToken[]; featured: BaseToken[]; error: boolean }> {
    try {
      let error = false;
      const tokens = await Promise.all(
        this.providers
          .filter((provider) => provider.isSupportedNetwork(chain))
          .map((provider) =>
            provider
              .getSupportedTokens(chain)
              .then((allTokens) => allTokens)
              .catch(() => {
                error = true;
                return { tokens: [], featured: [] } as {
                  tokens: BaseToken[];
                  featured: BaseToken[];
                };
              })
          )
      );

      const allTokens = tokens.reduce((prev, curr) => {
        if (prev) {
          return {
            tokens: prev.tokens.concat(curr.tokens),
            featured: prev.featured.concat(curr.featured),
          };
        } else {
          return curr;
        }
      });

      return { ...allTokens, error };
    } catch (error) {
      console.error(error);
      return { tokens: [], featured: [], error: true };
    }
  }

  public async getAllQuotes(
    chain: NetworkNames,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<{ quotes: QuoteInfo[]; error: boolean }> {
    let error = false;

    const quotes = await Promise.all(
      this.providers
        .filter((provider) => provider.isSupportedNetwork(chain))
        .map((provider) =>
          provider
            .getQuote(chain, fromToken, toToken, fromAmount)
            .then((quoteInfo) => quoteInfo)
            .catch(() => {
              error = true;
              console.error(error);
              return [];
            })
        )
    ).then((quotes) => quotes.flat());

    return { quotes, error: false };
  }

  public async getTradePreview(
    chain: NetworkNames,
    fromToken: BaseToken,
    toToken: BaseToken
  ): Promise<TradePreview | null> {
    let previews: (TradePreview | null)[];

    if ((toToken as ChangellyToken).changellyID) {
      const changelly = this.providers.find((provider) =>
        provider.supportedDexes.includes("CHANGELLY")
      );

      if (changelly) {
        previews = [await changelly.getTradePreview(chain, fromToken, toToken)];
      } else {
        return null;
      }
    } else {
      previews = await Promise.all(
        this.providers
          .filter((provider) => provider.isSupportedNetwork(chain))
          .map((provider) =>
            provider.getTradePreview(chain, fromToken, toToken)
          )
      );
    }

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
    chain: NetworkNames,
    fromAddress: string,
    toAddress: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string,
    swapMax: boolean
  ): Promise<TradeInfo[]> {
    if ((toToken as ChangellyToken).changellyID) {
      const changelly = this.providers.find((provider) =>
        provider.supportedDexes.includes("CHANGELLY")
      );

      if (changelly) {
        return changelly.getTrade(
          chain,
          fromAddress,
          toAddress,
          fromToken,
          toToken,
          fromAmount,
          swapMax
        );
      } else {
        return [];
      }
    }

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
            fromAmount,
            swapMax
          )
        )
    ).then((trades) => trades.flat());
  }

  public async executeTrade(
    network: BaseNetwork,
    fromAccount: EnkryptAccount,
    trade: TradeInfo,
    gasPriceType?: GasPriceTypes
  ): Promise<`0x${string}`[]> {
    const provider = this.providers.find((provider) =>
      provider.supportedDexes.includes(trade.provider)
    );

    if (!provider) {
      return ["0x"];
    }

    return provider.executeTrade(network, fromAccount, trade, gasPriceType);
  }
}
