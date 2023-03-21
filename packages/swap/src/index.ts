import fetch from "node-fetch";
import { merge } from "lodash";
import EventEmitter from "eventemitter3";
import { NATIVE_TOKEN_ADDRESS, TOKEN_LISTS } from "./configs";
import OneInch from "./providers/oneInch";
import Changelly from "./providers/changelly";
import NetworkDetails from "./common/supportedNetworks";
import {
  APIType,
  Events,
  EvmOptions,
  FromTokenType,
  getQuoteOptions,
  NetworkInfo,
  ProviderClass,
  ProviderFromTokenResponse,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  ProviderToTokenResponse,
  QuoteMetaOptions,
  SupportedNetworkName,
  SwapOptions,
  SwapQuote,
  TokenType,
  TokenTypeTo,
} from "./types";
import { sortByRank, sortNativeToFront } from "./utils/common";

class Swap extends EventEmitter {
  network: SupportedNetworkName;

  evmOptions: EvmOptions;

  private api: APIType;

  initPromise: Promise<void>;

  private providerClasses: (typeof OneInch | typeof Changelly)[];

  private providers: (OneInch | Changelly)[];

  private tokenList: FromTokenType;

  private fromTokens: TokenType[];

  private toTokens: Record<SupportedNetworkName, TokenTypeTo[]>;

  constructor(options: SwapOptions) {
    super();
    this.network = options.network;
    this.evmOptions = options.evmOptions
      ? options.evmOptions
      : {
          infiniteApproval: true,
        };
    this.api = options.api;
    this.providerClasses = [OneInch, Changelly];
    this.tokenList = {
      all: [],
      top: [],
      trending: [],
    };
    this.toTokens = {};
    this.fromTokens = [];
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
    const allFromTokens: ProviderFromTokenResponse = {};
    [...this.providers].reverse().forEach((p) => {
      Object.assign(allFromTokens, p.getFromTokens());
    });
    this.fromTokens = Object.values(allFromTokens).sort(sortNativeToFront);
    const native = this.fromTokens.shift();
    this.fromTokens.sort(sortByRank);
    this.fromTokens.unshift(native);
    const allToTokens: ProviderToTokenResponse = {};
    [...this.providers].reverse().forEach((p) => {
      merge(allToTokens, p.getToTokens());
    });
    Object.keys(allToTokens).forEach((nName) => {
      const values = Object.values(allToTokens[nName]);
      values.sort(sortNativeToFront);
      const nativeTo = values.shift();
      values.sort(sortByRank);
      values.unshift(nativeTo);
      this.toTokens[nName] = values;
    });
  }

  getFromTokens() {
    return this.fromTokens;
  }

  getToTokens() {
    return this.toTokens;
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse[] | null> {
    const response = await Promise.all(
      this.providers.map((Provider) =>
        Provider.getQuote(options, meta).then((res) => {
          if (!res) return res;
          this.emit(Events.QuoteUpdate, res.toTokenAmount);
          return res;
        })
      )
    );
    return response.filter((res) => res !== null);
  }

  getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    const provider = this.providers.find((p) => p.name === quote.provider);
    return provider.getSwap(quote);
  }

  static networkNameToInfo(networkName: SupportedNetworkName): NetworkInfo {
    return NetworkDetails[networkName];
  }
}

export default Swap;
