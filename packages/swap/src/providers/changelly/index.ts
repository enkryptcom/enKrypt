import type Web3Eth from "web3-eth";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { fromBase, toBase } from "@enkryptcom/utils";
import { numberToHex, toBN } from "web3-utils";
import { NetworkNames } from "@enkryptcom/types";
import {
  getQuoteOptions,
  MinMaxResponse,
  NetworkType,
  ProviderFromTokenResponse,
  ProviderName,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  ProviderToTokenResponse,
  QuoteMetaOptions,
  SwapQuote,
  SwapTransaction,
  TokenType,
  TokenTypeTo,
  TransactionStatus,
  TransactionType,
} from "../../types";
import {
  CHANGELLY_LIST,
  GAS_LIMITS,
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";

import { getTransfer } from "../../utils/approvals";
import supportedNetworks from "./supported";
import { ChangellyCurrency, ChangellyStatusOptions } from "./types";

const BASE_URL = "https://swap.mewapi.io/changelly";

class Changelly {
  tokenList: TokenType[];

  network: NetworkNames;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  changellyList: ChangellyCurrency[];

  contractToTicker: Record<string, string>;

  constructor(_web3eth: Web3Eth, network: NetworkNames) {
    this.network = network;
    this.tokenList = [];
    this.name = ProviderName.changelly;
    this.fromTokens = {};
    this.toTokens = {};
    this.contractToTicker = {};
  }

  async init(): Promise<void> {
    if (!Changelly.isSupported(this.network)) return;
    this.changellyList = await fetch(CHANGELLY_LIST).then((res) => res.json());
    const changellyToNetwork: Record<string, NetworkNames> = {};
    Object.keys(supportedNetworks).forEach((net) => {
      changellyToNetwork[supportedNetworks[net].changellyName] =
        net as NetworkNames;
    });
    const supportedChangellyNames = Object.values(supportedNetworks).map(
      (s) => s.changellyName
    );
    this.changellyList.forEach((cur) => {
      if (!supportedChangellyNames.includes(cur.blockchain)) return;
      if (cur.enabledFrom && cur.token) {
        this.fromTokens[cur.token.address] = cur.token;
      }
      if (cur.enabledTo && cur.token) {
        this.toTokens[cur.token.address] = {
          ...cur.token,
          networkInfo: {
            name: changellyToNetwork[cur.blockchain] as NetworkNames,
            isAddress: supportedNetworks[this.network].isAddress
              ? supportedNetworks[this.network].isAddress
              : (address: string) => this.isValidAddress(address, cur.ticker),
          },
        };
      }
      this.setTicker(cur.token, changellyToNetwork[cur.blockchain], cur.ticker);
    });
  }

  private setTicker(token: TokenType, network: NetworkNames, ticker: string) {
    this.contractToTicker[`${network}-${token.address}`] = ticker;
  }

  private getTicker(token: TokenType, network: NetworkNames) {
    return this.contractToTicker[`${network}-${token.address}`];
  }

  static isSupported(network: NetworkNames) {
    return Object.keys(supportedNetworks).includes(network);
  }

  private changellyRequest(method: string, params: any): Promise<any> {
    return fetch(`${BASE_URL}`, {
      method: "POST",
      body: JSON.stringify({
        id: uuidv4(),
        jsonrpc: "2.0",
        method,
        params,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());
  }

  isValidAddress(address: string, ticker: string): Promise<boolean> {
    return this.changellyRequest("validateAddress", {
      currency: ticker,
      address,
    }).then((response) => {
      if (response.error) return false;
      return response.result.result;
    });
  }

  getFromTokens() {
    return this.fromTokens;
  }

  getToTokens() {
    return this.toTokens;
  }

  getMinMaxAmount({
    fromToken,
    toToken,
  }: {
    fromToken: TokenType;
    toToken: TokenTypeTo;
  }): Promise<MinMaxResponse> {
    const emptyResponse = {
      minimumFrom: toBN("0"),
      maximumFrom: toBN("0"),
      minimumTo: toBN("0"),
      maximumTo: toBN("0"),
    };
    return this.changellyRequest("getFixRate", {
      from: this.getTicker(fromToken, this.network),
      to: this.getTicker(
        toToken as TokenType,
        toToken.networkInfo.name as NetworkNames
      ),
    })
      .then((response) => {
        if (response.error) return emptyResponse;
        const { result } = response;
        return {
          minimumFrom: toBN(toBase(result.minFrom, fromToken.decimals)),
          maximumFrom: toBN(toBase(result.maxFrom, fromToken.decimals)),
          minimumTo: toBN(toBase(result.minTo, toToken.decimals)),
          maximumTo: toBN(toBase(result.maxTo, toToken.decimals)),
        };
      })
      .catch(() => emptyResponse);
  }

  getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null> {
    if (
      !Changelly.isSupported(options.toNetwork as NetworkNames) ||
      !Changelly.isSupported(options.fromNetwork)
    )
      Promise.resolve(null);
    return this.changellyRequest("getFixRateForAmount", {
      from: this.getTicker(options.fromToken, this.network),
      to: this.getTicker(
        options.toToken as TokenType,
        options.toToken.networkInfo.name as NetworkNames
      ),
      amountFrom: fromBase(
        options.amount.toString(),
        options.fromToken.decimals
      ),
    })
      .then(async (response) => {
        if (response.error || !response.result.id) return null;
        const { result } = response;
        const evmGasLimit =
          options.fromToken.address === NATIVE_TOKEN_ADDRESS &&
          options.fromToken.type === NetworkType.EVM
            ? 21000
            : toBN(GAS_LIMITS.transferToken).toNumber();
        const retResponse: ProviderQuoteResponse = {
          fromTokenAmount: options.amount,
          toTokenAmount: toBN(
            toBase(result.amountTo, options.toToken.decimals)
          ),
          provider: this.name,
          quote: {
            meta: {
              ...meta,
              changellyQuoteId: result.id,
            },
            options,
          },
          totalGaslimit:
            options.fromToken.type === NetworkType.EVM ? evmGasLimit : 0,
          minMax: await this.getMinMaxAmount({
            fromToken: options.fromToken,
            toToken: options.toToken,
          }),
        };
        return retResponse;
      })
      .catch(() => null);
  }

  getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    if (
      !Changelly.isSupported(quote.options.toNetwork as NetworkNames) ||
      !Changelly.isSupported(quote.options.fromNetwork)
    )
      Promise.resolve(null);
    return this.changellyRequest("createFixTransaction", {
      from: this.getTicker(quote.options.fromToken, this.network),
      to: this.getTicker(
        quote.options.toToken as TokenType,
        quote.options.toToken.networkInfo.name as NetworkNames
      ),
      refundAddress: quote.options.fromAddress,
      address: quote.options.toAddress,
      amountFrom: fromBase(
        quote.options.amount.toString(),
        quote.options.fromToken.decimals
      ),
      rateId: quote.meta.changellyQuoteId,
    })
      .then(async (response) => {
        if (response.error || !response.result.id) return null;
        const { result } = response;
        let transaction: SwapTransaction;
        if (quote.options.fromToken.type === NetworkType.EVM) {
          if (quote.options.fromToken.address === NATIVE_TOKEN_ADDRESS)
            transaction = {
              data: "0x",
              gasLimit: numberToHex(21000),
              to: result.payinAddress,
              value: numberToHex(quote.options.amount),
              type: TransactionType.evm,
            };
          else
            transaction = getTransfer({
              contract: quote.options.fromToken.address,
              to: result.payinAddress,
              value: quote.options.amount.toString(),
            });
        } else {
          transaction = {
            to: result.payinAddress,
            value: numberToHex(quote.options.amount),
            type: TransactionType.generic,
          };
        }
        const retResponse: ProviderSwapResponse = {
          fromTokenAmount: quote.options.amount,
          provider: this.name,
          toTokenAmount: toBN(
            toBase(result.amountTo, quote.options.toToken.decimals)
          ),
          transactions: [transaction],
          getStatusObject: async (): Promise<ChangellyStatusOptions> => ({
            swapId: result.id,
          }),
        };
        return retResponse;
      })
      .catch(() => null);
  }

  getStatus(options: ChangellyStatusOptions): Promise<TransactionStatus> {
    return this.changellyRequest("getStatus", {
      id: options.swapId,
    }).then(async (response) => {
      if (response.error || !response.result.id)
        return TransactionStatus.pending;
      const completedStatuses = ["finished"];
      const pendingStatuses = [
        "confirming",
        "exchanging",
        "sending",
        "waiting",
        "new",
      ];
      const failedStatuses = ["failed", "refunded", "hold", "expired"];
      const status = response.result;
      if (pendingStatuses.includes(status)) return TransactionStatus.pending;
      if (completedStatuses.includes(status)) return TransactionStatus.success;
      if (failedStatuses.includes(status)) return TransactionStatus.failed;
      return TransactionStatus.pending;
    });
  }
}

export default Changelly;
