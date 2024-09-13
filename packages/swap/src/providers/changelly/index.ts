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
import estimateEVMGasList from "../../common/estimateGasList";

const DEBUG = false;

const BASE_URL = "https://partners.mewapi.io/changelly-v2";

let debug: (context: string, message: string, ...args: any[]) => void;
if (DEBUG) {
  debug = (context: string, message: string, ...args: any[]): void => {
    const now = new Date();
    const ymdhms =
      // eslint-disable-next-line prefer-template
      now.getFullYear().toString().padStart(4, "0") +
      "-" +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      now.getDate().toString().padStart(2, "0") +
      " " +
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0") +
      ":" +
      now.getSeconds().toString().padStart(2, "0") +
      "." +
      now.getMilliseconds().toString().padStart(3, "0");
    console.info(
      `\x1b[90m${ymdhms}\x1b[0m \x1b[32mChangellySwapProvider.${context}\x1b[0m: ${message}`,
      ...args
    );
  };
} else {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  debug = () => {};
}

class Changelly extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  /** Dynamically generated Changelly swap token data from the Enkrypt dynamic-lists repo {@link CHANGELLY_LIST} */
  changellyList: ChangellyCurrency[];

  contractToTicker: Record<string, string>;

  constructor(network: SupportedNetworkName) {
    super();
    this.network = network;
    this.tokenList = [];
    this.name = ProviderName.changelly;
    this.fromTokens = {};
    this.toTokens = {};
    this.contractToTicker = {};
  }

  async init(): Promise<void> {
    debug("init", "Initialising...");
    if (!Changelly.isSupported(this.network)) {
      debug(
        "init",
        `Enkrypt does not support Changelly on this network  network=${this.network}`
      );
      return;
    }
    this.changellyList = await fetch(CHANGELLY_LIST).then((res) => res.json());

    /** Mapping of changelly network name -> enkrypt network name */
    /** changelly blockchain name -> enkrypt supported swap network name */
    const changellyToNetwork: Record<string, SupportedNetworkName> = {};
    // Generate mapping of changelly blockchain -> enkrypt blockchain
    Object.keys(supportedNetworks).forEach((net) => {
      changellyToNetwork[supportedNetworks[net].changellyName] =
        net as unknown as SupportedNetworkName;
    });

    /** List of changelly blockchain names */
    const supportedChangellyNames = Object.values(supportedNetworks).map(
      (s) => s.changellyName
    );

    this.changellyList.forEach((cur) => {
      // Must be a supported token
      if (!supportedChangellyNames.includes(cur.blockchain)) {
        return;
      }
      if (
        cur.enabledFrom &&
        cur.fixRateEnabled &&
        cur.token &&
        changellyToNetwork[cur.blockchain] === this.network
      ) {
        this.fromTokens[cur.token.address] = cur.token;
      }

      // Can currency can be swapped to?
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

    debug(
      "init",
      `Finished initialising  this.changellyList.length=${this.changellyList.length}`
    );
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
    // TODO: timeoutes & retries?
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
      if (response.error) {
        debug(
          "isValidAddress",
          `Error in response when validating address` +
            `  address=${address}` +
            `  err=${String(response.error.message)}`
        );
        return false;
      }
      return response.result?.[0]?.result ?? false;
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
    const startedAt = Date.now();
    debug(
      "getMinMaxAmount",
      `Getting min and max of swap pair` +
        `  fromToken=${fromToken.symbol}` +
        `  toToken=${toToken.symbol}`
    );
    const emptyResponse = {
      minimumFrom: toBN("0"),
      maximumFrom: toBN("0"),
      minimumTo: toBN("0"),
      maximumTo: toBN("0"),
    };
    const method = "getFixRate";
    return this.changellyRequest(method, {
      from: this.getTicker(fromToken, this.network),
      to: this.getTicker(
        toToken as TokenType,
        toToken.networkInfo.name as SupportedNetworkName
      ),
    })
      .then((response) => {
        if (response.error) return emptyResponse;
        const result = response.result[0];
        const minMax = {
          minimumFrom: toBN(toBase(result.minFrom, fromToken.decimals)),
          maximumFrom: toBN(toBase(result.maxFrom, fromToken.decimals)),
          minimumTo: toBN(toBase(result.minTo, toToken.decimals)),
          maximumTo: toBN(toBase(result.maxTo, toToken.decimals)),
        };
        debug(
          "getMinMaxAmount",
          `Successfully got min and max of swap pair` +
            `  method=${method}` +
            `  fromToken=${fromToken.symbol}` +
            `  toToken=${toToken.symbol}` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms`
        );
        return minMax;
      })
      .catch((err: Error) => {
        debug(
          "getMinMaxAmount",
          `Errored calling getFixRate to get the min and max of swap pair` +
            `  method=${method}` +
            `  fromToken=${fromToken.symbol}` +
            `  toToken=${toToken.symbol}` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
            `  err=${String(err)}`
        );
        return emptyResponse;
      });
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null> {
    const startedAt = Date.now();

    debug(
      "getQuote",
      `Getting Changelly quote` +
        `  srcToken=${options.fromToken.symbol}` +
        `  dstToken=${options.toToken.symbol}` +
        `  fromAddress=${options.fromAddress}` +
        `  toAddress=${options.toAddress}` +
        `  fromNetwork=${this.network}` +
        `  toNetwork=${options.toToken.networkInfo.name}`
    );

    if (
      !Changelly.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName
      )
    ) {
      debug(
        "getQuote",
        `No swap: Enkrypt does not support Changelly on the destination network` +
          `  dstNetwork=${options.toToken.networkInfo.name}`
      );
      return null;
    }

    if (!Changelly.isSupported(this.network)) {
      debug(
        "getQuote",
        `No swap: Enkrypt does not support Changelly on the source network` +
          `  srcNetwork=${this.network}`
      );
      return null;
    }

    if (!this.getTicker(options.fromToken, this.network)) {
      debug(
        "getQuote",
        `No swap: Failed to find ticker for src token` +
          `  srcToken=${options.fromToken.symbol}` +
          `  srcNetwork=${this.network}`
      );
      return null;
    }

    if (
      !this.getTicker(
        options.toToken as TokenType,
        options.toToken.networkInfo.name as SupportedNetworkName
      )
    ) {
      debug(
        "getQuote",
        `No swap: Failed to find ticker for dst token` +
          `  dstToken=${options.toToken.symbol}` +
          `  dstNetwork=${options.toToken.networkInfo.name}`
      );
      return null;
    }

    const minMax = await this.getMinMaxAmount({
      fromToken: options.fromToken,
      toToken: options.toToken,
    });

    let quoteRequestAmount = options.amount;

    // Clamp `quoteRequestAmount`
    if (quoteRequestAmount.lt(minMax.minimumFrom))
      quoteRequestAmount = minMax.minimumFrom;
    else if (quoteRequestAmount.gt(minMax.maximumFrom))
      quoteRequestAmount = minMax.maximumFrom;

    if (quoteRequestAmount.toString() === "0") return null;

    const method = "getFixRateForAmount";
    debug("getQuote", `Requesting changelly swap...  method=${method}`);
    return this.changellyRequest(method, {
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
        debug("getQuote", `Received Changelly swap response  method=${method}`);
        if (response.error || !response.result || !response.result[0].id) {
          debug(
            "getQuote",
            `No swap: response either contains error, no result or no id` +
              `  method=${method}` +
              `  took=${(Date.now() - startedAt).toLocaleString()}ms`
          );
          return null;
        }
        const result = response.result[0];
        const evmGasLimit =
          options.fromToken.address === NATIVE_TOKEN_ADDRESS &&
          options.fromToken.type === NetworkType.EVM
            ? 21000
            : toBN(GAS_LIMITS.transferToken).toNumber();
        const retResponse: ProviderQuoteResponse = {
          fromTokenAmount: quoteRequestAmount,
          additionalNativeFees: toBN(0),
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
        debug(
          "getQuote",
          `Successfully processed Changelly swap response` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms`
        );
        return retResponse;
      })
      .catch((err) => {
        debug(
          "getQuote",
          `Changelly request failed` +
            `  method=${method}` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
            `  err=${String(err)}`
        );
        return null;
      });
  }

  getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    const startedAt = Date.now();
    debug("getSwap", `Getting Changelly swap`);

    if (!Changelly.isSupported(this.network)) {
      debug(
        "getSwap",
        `No swap: Enkrypt does not support Changelly on the source network` +
          `  srcNetwork=${this.network}`
      );
      return Promise.resolve(null);
    }

    if (
      !Changelly.isSupported(
        quote.options.toToken.networkInfo.name as SupportedNetworkName
      )
    ) {
      debug(
        "getSwap",
        `No swap: Enkrypt does not support Changelly on the destination network` +
          `  dstNetwork=${quote.options.toToken.networkInfo.name}`
      );
      return Promise.resolve(null);
    }

    const method = "createFixTransaction";
    debug("getSwap", `Requesting Changelly swap...  method=${method}`);
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
        debug("getSwap", `Received Changelly swap response  method=${method}`);
        if (response.error || !response.result.id) {
          debug(
            "getSwap",
            `No swap: response either contains error or no id` +
              `  method=${method}` +
              `  took=${(Date.now() - startedAt).toLocaleString()}ms`
          );
          return null;
        }
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
          const accurateGasEstimate = await estimateEVMGasList(
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
          additionalNativeFees: toBN(0),
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
        debug(
          "getSwap",
          `Successfully processed Changelly swap response` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms`
        );
        return retResponse;
      })
      .catch((err) => {
        debug(
          "getSwap",
          `Changelly request failed` +
            `  method=${method}` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
            `  err=${String(err)}`
        );
        return null;
      });
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
