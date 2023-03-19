import type Web3Eth from "web3-eth";
import { numberToHex, toBN, isAddress } from "web3-utils";
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
  TransactionStatus,
} from "../../types";
import { FEE_CONFIGS, GAS_LIMITS, NATIVE_TOKEN_ADDRESS } from "../../configs";
import {
  OneInchQuote,
  OneInchResponseType,
  OneInchSwapResponse,
} from "./types";
import {
  getAllowanceTransactions,
  TOKEN_AMOUNT_INFINITY_AND_BEYOND,
} from "../../utils/approvals";

const supportedNetworks: {
  [key in NetworkNames]?: { approvalAddress: string; chainId: string };
} = {
  [NetworkNames.Ethereum]: {
    approvalAddress: "0x1111111254eeb25477b68fb85ed929f73a960582",
    chainId: "1",
  },
  [NetworkNames.Binance]: {
    approvalAddress: "0x1111111254eeb25477b68fb85ed929f73a960582",
    chainId: "56",
  },
  [NetworkNames.Matic]: {
    approvalAddress: "0x1111111254eeb25477b68fb85ed929f73a960582",
    chainId: "137",
  },
  [NetworkNames.Optimism]: {
    approvalAddress: "0x1111111254eeb25477b68fb85ed929f73a960582",
    chainId: "10",
  },
};

const BASE_URL = "https://api.1inch.io/v5.0/";

class OneInch {
  tokenList: TokenType[];

  network: NetworkNames;

  web3eth: Web3Eth;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  constructor(web3eth: Web3Eth, network: NetworkNames) {
    this.network = network;
    this.tokenList = [];
    this.web3eth = web3eth;
    this.name = ProviderName.oneInch;
    this.fromTokens = {};
  }

  init(tokenList: TokenType[]): Promise<void> {
    if (!OneInch.isSupported(this.network)) return;
    tokenList.forEach((t) => {
      this.fromTokens[t.address] = t;
      this.toTokens[t.address] = {
        ...t,
        networkInfo: {
          name: this.network,
          isAddress: (address: string) => Promise.resolve(isAddress(address)),
        },
      };
    });
  }

  static isSupported(network: NetworkNames) {
    return Object.keys(supportedNetworks).includes(network);
  }

  getFromTokens() {
    return this.fromTokens;
  }

  getToTokens() {
    return this.toTokens;
  }

  getMinMaxAmount(): Promise<MinMaxResponse> {
    return Promise.resolve({
      minimumFrom: toBN("1"),
      maximumFrom: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
      minimumTo: toBN("1"),
      maximumTo: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
    });
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
        minMax: await this.getMinMaxAmount(),
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

export default OneInch;
