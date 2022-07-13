import { BaseToken } from "@/types/base-token";
import { EvmSwapProvider } from "./types/EvmSwapProvider";
import { SwapProvider } from "./types/SwapProvider";

export class Swap {
  public providers: SwapProvider[] = [new EvmSwapProvider()];

  public async getAllTokens(chainName: string): Promise<BaseToken[]> {
    return Promise.all(
      this.providers.map((provider) => provider.getSupportedTokens(chainName))
    ).then((tokens) => tokens.flat());
  }
}
