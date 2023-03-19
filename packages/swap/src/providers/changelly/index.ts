import type Web3Eth from "web3-eth";
import fetch from "node-fetch";
import { fromBase, toBase } from "@enkryptcom/utils";
import { numberToHex, toBN } from "web3-utils";
import { NetworkNames } from "@enkryptcom/types";
import {
  EVMTransaction,
  getQuoteOptions,
  MinMaxResponse,
  ProviderFromTokenResponse,
  ProviderName,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  ProviderToTokenResponse,
  QuoteMetaOptions,
  StatusOptions,
  TokenType,
  TokenTypeTo,
  TransactionStatus,
} from "../../types";
import {
  CHANGELLY_LIST,
  FEE_CONFIGS,
  GAS_LIMITS,
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";
import {
  OneInchQuote,
  OneInchResponseType,
  OneInchSwapResponse,
} from "../oneInch/types";
import { getAllowanceTransactions } from "../../utils/approvals";
import supportedNetworks from "./supported";
import { ChangellyCurrency } from "./types";

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
        id: "1",
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
    return this.changellyRequest("getFixRate", [
      {
        from: this.getTicker(fromToken, this.network),
        to: this.getTicker(
          toToken as TokenType,
          toToken.networkInfo.name as NetworkNames
        ),
      },
    ])
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

  private getOneInchSwap(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<OneInchSwapResponse | null> {
    if (
      !OneInch.isSupported(options.toNetwork as NetworkNames) ||
      !OneInch.isSupported(options.fromNetwork)
    )
      Promise.resolve(null);
    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];
    const params = new URLSearchParams({
      fromTokenAddress: options.fromToken.address,
      toTokenAddress: options.toToken.address,
      amount: options.amount.toString(),
      fromAddress: options.fromAddress,
      destReceiver: options.toAddress,
      slippage: meta.slippage ? meta.slippage : "0.5",
      fee: feeConfig ? (feeConfig.fee * 100).toFixed(3) : "0",
      referrerAddress: feeConfig ? feeConfig.referrer : "",
      disableEstimate: "true",
    });
    return fetch(
      `${BASE_URL}${
        supportedNetworks[options.fromNetwork].chainId
      }/swap?${params.toString()}`
    )
      .then((res) => res.json())
      .then(async (response: OneInchResponseType) => {
        if (response.error) {
          console.error(response.error, response.description);
          return Promise.resolve(null);
        }
        const transactions: EVMTransaction[] = [];

        if (options.fromToken.address !== NATIVE_TOKEN_ADDRESS) {
          const approvalTxs = await getAllowanceTransactions({
            infinityApproval: meta.infiniteApproval,
            spender: supportedNetworks[options.fromNetwork].approvalAddress,
            web3eth: this.web3eth,
            amount: options.amount,
            fromAddress: options.fromAddress,
            fromToken: options.fromToken,
          });
          transactions.push(...approvalTxs);
        }
        transactions.push({
          gasLimit: GAS_LIMITS.swap,
          to: response.tx.to,
          value: numberToHex(response.tx.value),
          data: response.tx.data,
        });
        return {
          transactions,
          toTokenAmount: toBN(response.toTokenAmount),
          fromTokenAmount: toBN(response.fromTokenAmount),
        };
      });
  }

  getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null> {
    return this.getOneInchSwap(options, meta).then(async (res) => {
      if (!res) return null;
      const response: ProviderQuoteResponse = {
        fromTokenAmount: res.fromTokenAmount,
        toTokenAmount: res.toTokenAmount,
        provider: this.name,
        quote: {
          meta,
          options,
        },
        totalGaslimit: res.transactions.reduce(
          (total: number, curVal: EVMTransaction) =>
            total + toBN(curVal.gasLimit).toNumber(),
          0
        ),
        minMax: await this.getMinMaxAmount({ fromToken: options.fromToken }),
      };
      return response;
    });
  }

  getSwap(quote: OneInchQuote): Promise<ProviderSwapResponse | null> {
    return this.getOneInchSwap(quote.options, quote.meta).then((res) => {
      if (!res) return null;
      const response: ProviderSwapResponse = {
        fromTokenAmount: res.fromTokenAmount,
        provider: this.name,
        toTokenAmount: res.toTokenAmount,
        transactions: res.transactions,
        getStatusObject: async (options: StatusOptions) => options,
      };
      return response;
    });
  }

  getStatus(options: StatusOptions): Promise<TransactionStatus> {
    const promises = options.transactionHashes.map((hash) =>
      this.web3eth.getTransactionReceipt(hash)
    );
    return Promise.all(promises).then((receipts) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const receipt of receipts) {
        if (!receipt || (receipt && !receipt.blockNumber)) {
          return TransactionStatus.pending;
        }
        if (receipt && !receipt.status) return TransactionStatus.failed;
      }
      return TransactionStatus.success;
    });
  }
}

export default Changelly;
