import { BaseToken } from "@/types/base-token";
import { EvmSwapProvider } from "./types/EvmSwapProvider";
import { QuoteInfo, SwapProvider } from "./types/SwapProvider";

export class Swap {
  public providers: SwapProvider[] = [new EvmSwapProvider()];

  public async getAllTokens(chainName: string): Promise<BaseToken[]> {
    return Promise.all(
      this.providers.map((provider) => provider.getSupportedTokens(chainName))
    ).then((tokens) => tokens.flat());
  }

  public async getAllQuotes(
    fromToken: BaseToken,
    toToken: BaseToken,
    fromAmount: string
  ): Promise<QuoteInfo[]> {
    return Promise.all(
      this.providers.map((provider) =>
        provider.getQuote(fromToken, toToken, fromAmount)
      )
    ).then((quotes) => quotes.flat());
  }
}
