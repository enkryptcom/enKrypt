import { merge } from "lodash";
import EventEmitter from "eventemitter3";
import type Web3Eth from "web3-eth";
import type { Connection as Web3Solana } from "@solana/web3.js";
import { TOKEN_LISTS, TOP_TOKEN_INFO_LIST } from "./configs";
import OneInch from "./providers/oneInch";
import Paraswap from "./providers/paraswap";
import Changelly from "./providers/changelly";
import ZeroX from "./providers/zerox";
import Rango from "./providers/rango";
import NetworkDetails, {
  isSupportedNetwork,
  getSupportedNetworks,
  getNetworkInfoByName,
} from "./common/supportedNetworks";
import type {
  APIType,
  EvmOptions,
  FromTokenType,
  getQuoteOptions,
  NetworkInfo,
  ProviderFromTokenResponse,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  ProviderToTokenResponse,
  SwapOptions,
  SwapQuote,
  TokenType,
  TokenTypeTo,
  TopTokenInfo,
  ToTokenType,
  GenericTransaction,
  SolanaTransaction,
  EVMTransaction,
  StatusOptionsResponse,
  StatusOptions,
  ProviderClass,
} from "./types";
import {
  SupportedNetworkName,
  Events,
  WalletIdentifier,
  NetworkType,
  TransactionType,
  TransactionStatus,
} from "./types";
import { sortByRank, sortNativeToFront } from "./utils/common";
import SwapToken from "./swapToken";
import { Jupiter } from "./providers/jupiter";

class Swap extends EventEmitter {
  network: SupportedNetworkName;

  evmOptions: EvmOptions;

  private api: APIType;

  initPromise: Promise<void>;

  private providers: ProviderClass[];

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
      : { infiniteApproval: true };
    this.api = options.api;
    this.walletId = options.walletIdentifier;
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
    if (TOKEN_LISTS[this.network]) {
      this.tokenList = await fetch(TOKEN_LISTS[this.network]).then((res) =>
        res.json(),
      );
    }

    this.topTokenInfo = await fetch(TOP_TOKEN_INFO_LIST).then((res) =>
      res.json(),
    );

    // TODO: use network type instead?
    switch (this.network) {
      case SupportedNetworkName.Solana:
        // Solana
        this.providers = [
          new Jupiter(this.api as Web3Solana, this.network),
          new Rango(this.api as Web3Solana, this.network),
          new Changelly(this.api, this.network),
        ];
        break;
      default:
        // EVM
        this.providers = [
          new OneInch(this.api as Web3Eth, this.network),
          new Paraswap(this.api as Web3Eth, this.network),
          new Changelly(this.api, this.network),
          new ZeroX(this.api as Web3Eth, this.network),
          new Rango(this.api as Web3Eth, this.network),
        ];
        break;
    }

    await Promise.all(
      this.providers.map((Provider) => Provider.init(this.tokenList.all)),
    );
    const allFromTokens: ProviderFromTokenResponse = {};
    [...this.providers].reverse().forEach((p) => {
      Object.assign(allFromTokens, p.getFromTokens());
    });
    this.fromTokens = {
      all: Object.values(allFromTokens).sort(sortNativeToFront),
      top: this.tokenList.top.filter((topt) => !!allFromTokens[topt.address]),
      trending: this.tokenList.trending.filter(
        (trendt) => !!allFromTokens[trendt.address],
      ),
    };
    const native = this.fromTokens.all.shift();
    this.fromTokens.all.sort(sortByRank);
    if (native) this.fromTokens.all.unshift(native);
    const allToTokens: ProviderToTokenResponse = {};
    [...this.providers].reverse().forEach((p) => {
      merge(allToTokens, p.getToTokens());
    });
    Object.keys(allToTokens).forEach((nName) => {
      const values = Object.values(allToTokens[nName]);
      values.sort(sortNativeToFront);
      const nativeTo = values.shift();
      values.sort(sortByRank);
      if (nativeTo) values.unshift(nativeTo);
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

  /**
   * Request a quote from each provider
   *
   * Only providers that support the network will respond
   */
  async getQuotes(
    options: getQuoteOptions,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderQuoteResponse[]> {
    const response = await Promise.all(
      this.providers.map((provider) =>
        provider
          .getQuote(
            options,
            {
              infiniteApproval: this.evmOptions.infiniteApproval,
              walletIdentifier: this.walletId,
            },
            context,
          )
          .then((res) => {
            if (!res) return res;
            this.emit(Events.QuoteUpdate, res.toTokenAmount);
            return res;
          }),
      ),
    );
    // Sort by the dest token amount i.e. best offer first
    return response
      .filter((res) => res !== null)
      .sort((a, b) => (b.toTokenAmount.gt(a.toTokenAmount) ? 1 : -1));
  }

  getSwap(
    quote: SwapQuote,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderSwapResponse | null> {
    const provider = this.providers.find((p) => p.name === quote.provider);
    return provider.getSwap(quote, context);
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
  SolanaTransaction,
  EVMTransaction,
  TransactionType,
  TransactionStatus,
  StatusOptionsResponse,
  StatusOptions,
};

export default Swap;
