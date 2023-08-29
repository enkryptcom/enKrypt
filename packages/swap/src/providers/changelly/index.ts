import type Web3Eth from "web3-eth";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { fromBase, toBase } from "@enkryptcom/utils";
import { numberToHex, toBN } from "web3-utils";
import {
  getQuoteOptions,
  MinMaxResponse,
  NetworkType,
  ProviderClass,
  ProviderFromTokenResponse,
  ProviderName,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  ProviderToTokenResponse,
  QuoteMetaOptions,
  StatusOptions,
  StatusOptionsResponse,
  SupportedNetworkName,
  SwapQuote,
  SwapTransaction,
  TokenType,
  TokenTypeTo,
  TransactionStatus,
  TransactionType,
} from "../../types";
import {
  CHANGELLY_LIST,
  DEFAULT_SLIPPAGE,
  GAS_LIMITS,
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";

import { getTransfer } from "../../utils/approvals";
import supportedNetworks from "./supported";
import { ChangellyCurrency } from "./types";
import estimateGasList from "../../common/estimateGasList";

const BASE_URL = "https://partners.mewapi.io/changelly-v2";

class Changelly extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  changellyList: ChangellyCurrency[];

  contractToTicker: Record<string, string>;

  constructor(_web3eth: Web3Eth, network: SupportedNetworkName) {
    super(_web3eth, network);
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
    const changellyToNetwork: Record<string, SupportedNetworkName> = {};
    Object.keys(supportedNetworks).forEach((net) => {
      changellyToNetwork[supportedNetworks[net].changellyName] =
        net as unknown as SupportedNetworkName;
    });
    const supportedChangellyNames = Object.values(supportedNetworks).map(
      (s) => s.changellyName
    );
    this.changellyList.forEach((cur) => {
      if (!supportedChangellyNames.includes(cur.blockchain)) return;
      if (
        cur.enabledFrom &&
        cur.fixRateEnabled &&
        cur.token &&
        changellyToNetwork[cur.blockchain] === this.network
      ) {
        this.fromTokens[cur.token.address] = cur.token;
      }
      if (cur.enabledTo && cur.fixRateEnabled && cur.token) {
        if (!this.toTokens[changellyToNetwork[cur.blockchain]])
          this.toTokens[changellyToNetwork[cur.blockchain]] = {};
        this.toTokens[changellyToNetwork[cur.blockchain]][cur.token.address] = {
          ...cur.token,
          networkInfo: {
            name: changellyToNetwork[cur.blockchain] as SupportedNetworkName,
            isAddress: supportedNetworks[changellyToNetwork[cur.blockchain]]
              .isAddress
              ? supportedNetworks[changellyToNetwork[cur.blockchain]].isAddress
              : (address: string) => this.isValidAddress(address, cur.ticker),
          },
        };
      }
      if (cur.token)
        this.setTicker(
          cur.token,
          changellyToNetwork[cur.blockchain],
          cur.ticker
        );
    });
  }

  private setTicker(
    token: TokenType,
    network: SupportedNetworkName,
    ticker: string
  ) {
    this.contractToTicker[`${network}-${token.address}`] = ticker;
  }

  private getTicker(token: TokenType, network: SupportedNetworkName) {
    return this.contractToTicker[`${network}-${token.address}`];
  }

  static isSupported(network: SupportedNetworkName) {
    return Object.keys(supportedNetworks).includes(
      network as unknown as string
    );
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
      if (response.error || !response.result) return false;
      return response.result[0].result;
    });
  }

  getFromTokens() {
    return this.fromTokens;
  }

  getToTokens() {
    if (Object.keys(this.fromTokens).length) return this.toTokens;
    return {};
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
        toToken.networkInfo.name as SupportedNetworkName
      ),
    })
      .then((response) => {
        if (response.error) return emptyResponse;
        const result = response.result[0];
        return {
          minimumFrom: toBN(toBase(result.minFrom, fromToken.decimals)),
          maximumFrom: toBN(toBase(result.maxFrom, fromToken.decimals)),
          minimumTo: toBN(toBase(result.minTo, toToken.decimals)),
          maximumTo: toBN(toBase(result.maxTo, toToken.decimals)),
        };
      })
      .catch(() => emptyResponse);
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null> {
    if (
      !Changelly.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName
      ) ||
      !Changelly.isSupported(this.network) ||
      !this.getTicker(options.fromToken, this.network) ||
      !this.getTicker(
        options.toToken as TokenType,
        options.toToken.networkInfo.name as SupportedNetworkName
      )
    )
      return Promise.resolve(null);
    const minMax = await this.getMinMaxAmount({
      fromToken: options.fromToken,
      toToken: options.toToken,
    });
    let quoteRequestAmount = options.amount;
    if (quoteRequestAmount.lt(minMax.minimumFrom))
      quoteRequestAmount = minMax.minimumFrom;
    else if (quoteRequestAmount.gt(minMax.maximumFrom))
      quoteRequestAmount = minMax.maximumFrom;
    if (quoteRequestAmount.toString() === "0") return null;
    return this.changellyRequest("getFixRateForAmount", {
      from: this.getTicker(options.fromToken, this.network),
      to: this.getTicker(
        options.toToken as TokenType,
        options.toToken.networkInfo.name as SupportedNetworkName
      ),
      amountFrom: fromBase(
        quoteRequestAmount.toString(),
        options.fromToken.decimals
      ),
    })
      .then(async (response) => {
        if (response.error || !response.result || !response.result[0].id)
          return null;
        const result = response.result[0];
        const evmGasLimit =
          options.fromToken.address === NATIVE_TOKEN_ADDRESS &&
          options.fromToken.type === NetworkType.EVM
            ? 21000
            : toBN(GAS_LIMITS.transferToken).toNumber();
        const retResponse: ProviderQuoteResponse = {
          fromTokenAmount: quoteRequestAmount,
          toTokenAmount: toBN(
            toBase(result.amountTo, options.toToken.decimals)
          ).sub(toBN(toBase(result.networkFee, options.toToken.decimals))),
          provider: this.name,
          quote: {
            meta: {
              ...meta,
              changellyQuoteId: result.id,
              changellynetworkFee: toBN(
                toBase(result.networkFee, options.toToken.decimals)
              ),
            },
            options: {
              ...options,
              amount: quoteRequestAmount,
            },
            provider: this.name,
          },
          totalGaslimit:
            options.fromToken.type === NetworkType.EVM ? evmGasLimit : 0,
          minMax,
        };
        return retResponse;
      })
      .catch(() => null);
  }

  getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    if (
      !Changelly.isSupported(
        quote.options.toToken.networkInfo.name as SupportedNetworkName
      ) ||
      !Changelly.isSupported(this.network)
    )
      return Promise.resolve(null);
    return this.changellyRequest("createFixTransaction", {
      from: this.getTicker(quote.options.fromToken, this.network),
      to: this.getTicker(
        quote.options.toToken as TokenType,
        quote.options.toToken.networkInfo.name as SupportedNetworkName
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
              from: quote.options.fromAddress,
              data: "0x",
              gasLimit: numberToHex(21000),
              to: result.payinAddress,
              value: numberToHex(quote.options.amount),
              type: TransactionType.evm,
            };
          else
            transaction = getTransfer({
              from: quote.options.fromAddress,
              contract: quote.options.fromToken.address,
              to: result.payinAddress,
              value: quote.options.amount.toString(),
            });
          const accurateGasEstimate = await estimateGasList(
            [transaction],
            this.network
          );
          if (accurateGasEstimate) {
            if (accurateGasEstimate.isError) return null;
            const [txGaslimit] = accurateGasEstimate.result;
            transaction.gasLimit = txGaslimit;
          }
        } else {
          transaction = {
            from: quote.options.fromAddress,
            to: result.payinAddress,
            value: numberToHex(quote.options.amount),
            type: TransactionType.generic,
          };
        }
        const fee = 1;
        const retResponse: ProviderSwapResponse = {
          fromTokenAmount: quote.options.amount,
          provider: this.name,
          toTokenAmount: toBN(
            toBase(result.amountExpectedTo, quote.options.toToken.decimals)
          ).sub(quote.meta.changellynetworkFee),
          transactions: [transaction],
          slippage: quote.meta.slippage || DEFAULT_SLIPPAGE,
          fee,
          getStatusObject: async (
            options: StatusOptions
          ): Promise<StatusOptionsResponse> => ({
            options: {
              ...options,
              swapId: result.id,
            },
            provider: this.name,
          }),
        };
        return retResponse;
      })
      .catch(() => null);
  }

  getStatus(options: StatusOptions): Promise<TransactionStatus> {
    return this.changellyRequest("getStatus", {
      id: options.swapId,
    }).then(async (response) => {
      if (response.error || !response.result) return TransactionStatus.pending;
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
