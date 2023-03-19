import { NetworkNames } from "@enkryptcom/types";
import fetch from "node-fetch";
import { TOKEN_LISTS } from "./configs";
import OneInch from "./providers/oneInch";
import { APIType, EvmOptions, FromTokenType, SwapOptions } from "./types";

class Swap {
  network: NetworkNames;

  evmOptions: EvmOptions;

  api: APIType;

  initPromise: Promise<void>;

  providerClasses: (typeof OneInch)[];

  providers: OneInch[];

  tokenList: FromTokenType;

  constructor(options: SwapOptions) {
    this.network = options.network;
    this.evmOptions = options.evmOptions
      ? options.evmOptions
      : {
          infiniteApproval: true,
        };
    this.api = options.api;
    this.providerClasses = [OneInch];
    this.tokenList = {
      all: [],
      top: [],
      trending: [],
    };
    this.initPromise = this.init();
  }

  private async init() {
    if (TOKEN_LISTS[this.network])
      this.tokenList = await fetch(TOKEN_LISTS[this.network]).then((res) =>
        res.json()
      );
    this.providers = this.providerClasses.map(
      (Provider) => new Provider(this.api, this.network)
    );
    await Promise.all(
      this.providers.map((Provider) => Provider.init(this.tokenList.all))
    );
  }
  // getFromTokens(): Promise<FromTokenType[]> {}
}

export default Swap;
