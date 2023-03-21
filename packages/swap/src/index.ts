import fetch from "node-fetch";
import { TOKEN_LISTS } from "./configs";
import OneInch from "./providers/oneInch";
import Changelly from "./providers/changelly";
import NetworkDetails from "./common/supportedNetworks";
import {
  APIType,
  EvmOptions,
  FromTokenType,
  NetworkInfo,
  SupportedNetworkName,
  SwapOptions,
} from "./types";

class Swap {
  network: SupportedNetworkName;

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

  static networkNameToInfo(networkName: SupportedNetworkName): NetworkInfo {
    return NetworkDetails[networkName];
  }
}

export default Swap;
