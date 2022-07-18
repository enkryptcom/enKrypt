import { BaseToken } from "@/types/base-token";
import { EvmSwapProvider, ChangellySwapProvider } from "./types";
import { QuoteInfo, SwapProvider, Trade } from "./types/SwapProvider";
import EvmAPI from "../ethereum/libs/api";
import SubstrateAPI from "../polkadot/libs/api";

export class Swap {
  public providers: SwapProvider[] = [
    new EvmSwapProvider(),
    new ChangellySwapProvider(),
  ];

  public async getAllTokens(chainName: string): Promise<BaseToken[]> {
    return Promise.all(
      this.providers.map((provider) => provider.getSupportedTokens(chainName))
    ).then((tokens) => tokens.flat());
  }

  public async getAllQuotes(
    chain: string,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<QuoteInfo[]> {
    return Promise.all(
      this.providers.map((provider) =>
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

  public async getTrade(
    chain: string,
    fromAddress: string,
    toAddress: string,
    quote: QuoteInfo,
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<Trade | null> {
    const provider = this.providers.find((provider) =>
      provider.supportedDexes.includes(quote.dex)
    );

    if (!provider) {
      return null;
    }

    return provider.getTrade(
      chain,
      fromAddress,
      toAddress,
      quote,
      fromToken,
      toToken,
      fromAmount
    );
  }

  public async executeTrade(
    api: EvmAPI | SubstrateAPI,
    trade: Trade,
    confirmInfo: any
  ) {
    const provider = this.providers.find((provider) =>
      provider.supportedDexes.includes(trade.dex)
    );

    if (!provider) {
      return null;
    }

    return provider.executeTrade(api, trade, confirmInfo);
  }
}
