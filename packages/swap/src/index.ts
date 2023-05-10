import fetch from "node-fetch";
import { merge } from "lodash";
import EventEmitter from "eventemitter3";
import { TOKEN_LISTS, TOP_TOKEN_INFO_LIST } from "./configs";
import OneInch from "./providers/oneInch";
import Paraswap from "./providers/paraswap";
import Changelly from "./providers/changelly";
import ZeroX from "./providers/zerox";
import NetworkDetails, {
  isSupportedNetwork,
  getSupportedNetworks,
  getNetworkInfoByName,
} from "./common/supportedNetworks";
import {
  APIType,
  Events,
  EvmOptions,
  FromTokenType,
  getQuoteOptions,
  NetworkInfo,
  ProviderFromTokenResponse,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  ProviderToTokenResponse,
  SupportedNetworkName,
  SwapOptions,
  SwapQuote,
  TokenType,
  TokenTypeTo,
  TopTokenInfo,
  ToTokenType,
  WalletIdentifier,
  NetworkType,
  GenericTransaction,
  EVMTransaction,
  TransactionType,
  StatusOptionsResponse,
  TransactionStatus,
  StatusOptions,
} from "./types";
import { sortByRank, sortNativeToFront } from "./utils/common";
import SwapToken from "./swapToken";

class Swap extends EventEmitter {
  network: SupportedNetworkName;

  evmOptions: EvmOptions;

  private api: APIType;

  initPromise: Promise<void>;

  private providerClasses: (
    | typeof OneInch
    | typeof Changelly
    | typeof Paraswap
    | typeof ZeroX
  )[];

  private providers: (OneInch | Changelly | Paraswap | ZeroX)[];

  private tokenList: FromTokenType;

  private topTokenInfo: TopTokenInfo;

  private fromTokens: FromTokenType;

  private toTokens: ToTokenType;

  private walletId: WalletIdentifier;

  constructor(options: SwapOptions) {
    super();
    this.network = options.network;
    this.evmOptions = options.evmOptions
      ? options.evmOptions
      : {
          infiniteApproval: true,
        };
    this.api = options.api;
    this.walletId = options.walletIdentifier;
    this.providerClasses = [OneInch, Paraswap, Changelly, ZeroX];
    this.topTokenInfo = {
      contractsToId: {},
      topTokens: {},
      trendingTokens: {},
    };
    this.tokenList = {
      all: [],
      top: [],
      trending: [],
    };
    this.toTokens = {
      all: {},
      top: {},
      trending: {},
    };
    this.fromTokens = {
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
    this.topTokenInfo = await fetch(TOP_TOKEN_INFO_LIST).then((res) =>
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
    this.fromTokens = {
      all: Object.values(allFromTokens).sort(sortNativeToFront),
      top: this.tokenList.top.filter((topt) => !!allFromTokens[topt.address]),
      trending: this.tokenList.trending.filter(
        (trendt) => !!allFromTokens[trendt.address]
      ),
    };
    const native = this.fromTokens.all.shift();
    this.fromTokens.all.sort(sortByRank);
    this.fromTokens.all.unshift(native);
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
      values.forEach((val: TokenTypeTo) => {
        if (val.cgId && this.topTokenInfo.topTokens[val.cgId]) {
          if (!this.toTokens.top[nName]) this.toTokens.top[nName] = [];
          this.toTokens.top[nName].push({
            ...val,
            rank: this.topTokenInfo.topTokens[val.cgId].rank,
          });
        }
        if (val.cgId && this.topTokenInfo.trendingTokens[val.cgId]) {
          if (!this.toTokens.trending[nName])
            this.toTokens.trending[nName] = [];
          this.toTokens.trending[nName].push({
            ...val,
            rank: this.topTokenInfo.trendingTokens[val.cgId],
          });
        }
      });
      if (this.toTokens.top[nName]) this.toTokens.top[nName].sort(sortByRank);
      if (this.toTokens.trending[nName])
        this.toTokens.trending[nName].sort(sortByRank);
      this.toTokens.all[nName] = values;
    });
  }

  getFromTokens() {
    return this.fromTokens;
  }

  getToTokens() {
    return this.toTokens;
  }

  async getQuotes(options: getQuoteOptions): Promise<ProviderQuoteResponse[]> {
    const response = await Promise.all(
      this.providers.map((Provider) =>
        Provider.getQuote(options, {
          infiniteApproval: this.evmOptions.infiniteApproval,
          walletIdentifier: this.walletId,
        }).then((res) => {
          if (!res) return res;
          this.emit(Events.QuoteUpdate, res.toTokenAmount);
          return res;
        })
      )
    );
    return response
      .filter((res) => res !== null)
      .sort((a, b) => (b.toTokenAmount.gt(a.toTokenAmount) ? 1 : -1));
  }

  getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    const provider = this.providers.find((p) => p.name === quote.provider);
    return provider.getSwap(quote);
  }

  getStatus(options: StatusOptionsResponse): Promise<TransactionStatus | null> {
    const provider = this.providers.find((p) => p.name === options.provider);
    return provider.getStatus(options.options);
  }

  static networkNameToInfo(networkName: SupportedNetworkName): NetworkInfo {
    return NetworkDetails[networkName];
  }
}

export {
  SwapToken,
  isSupportedNetwork,
  getSupportedNetworks,
  TokenType,
  TokenTypeTo,
  WalletIdentifier,
  SupportedNetworkName,
  getNetworkInfoByName,
  sortByRank,
  sortNativeToFront,
  NetworkInfo,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  NetworkType,
  GenericTransaction,
  EVMTransaction,
  TransactionType,
  TransactionStatus,
  StatusOptionsResponse,
  StatusOptions,
};
export default Swap;
