import { NetworkNames } from "@enkryptcom/types";
import SwapToken from "./swapToken";
import { EvmOptions, FromTokenType, SwapOptions } from "./types";

class Swap {
  network: NetworkNames;

  evmOptions: EvmOptions;

  constructor(options: SwapOptions) {
    this.network = options.network;
    this.evmOptions = options.evmOptions
      ? options.evmOptions
      : {
          infiniteApproval: true,
        };
  }

  // getFromTokens(): Promise<FromTokenType[]> {}
}

export default Swap;
