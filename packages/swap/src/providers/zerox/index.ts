import type Web3Eth from "web3-eth";
import { numberToHex, toBN } from "web3-utils";
import {
  EVMTransaction,
  getQuoteOptions,
  MinMaxResponse,
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
  TokenType,
  TransactionStatus,
  TransactionType,
} from "../../types";
import {
  DEFAULT_SLIPPAGE,
  FEE_CONFIGS,
  GAS_LIMITS,
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";
import { ZeroXResponseType, ZeroXSwapResponse } from "./types";
import {
  getAllowanceTransactions,
  TOKEN_AMOUNT_INFINITY_AND_BEYOND,
} from "../../utils/approvals";
import estimateGasList from "../../common/estimateGasList";
import { isEVMAddress } from "../../utils/common";

const supportedNetworks: {
  [key in SupportedNetworkName]?: { approvalAddress: string; chainId: string };
} = {
  [SupportedNetworkName.Ethereum]: {
    approvalAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    chainId: "1",
  },
  [SupportedNetworkName.Binance]: {
    approvalAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    chainId: "56",
  },
  [SupportedNetworkName.Matic]: {
    approvalAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    chainId: "137",
  },
  [SupportedNetworkName.Optimism]: {
    approvalAddress: "0xdef1abe32c034e558cdd535791643c58a13acc10",
    chainId: "10",
  },
  [SupportedNetworkName.Avalanche]: {
    approvalAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    chainId: "43114",
  },
  [SupportedNetworkName.Fantom]: {
    approvalAddress: "0xdef189deaef76e379df891899eb5a00a94cbc250",
    chainId: "250",
  },
  [SupportedNetworkName.Arbitrum]: {
    approvalAddress: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    chainId: "42161",
  },
};

const BASE_URL = "https://partners.mewapi.io/zerox/";

class ZeroX extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  web3eth: Web3Eth;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  constructor(web3eth: Web3Eth, network: SupportedNetworkName) {
    super(web3eth, network);
    this.network = network;
    this.tokenList = [];
    this.web3eth = web3eth;
    this.name = ProviderName.zerox;
    this.fromTokens = {};
    this.toTokens = {};
  }

  init(tokenList: TokenType[]): Promise<void> {
    if (!ZeroX.isSupported(this.network)) return;
    tokenList.forEach((t) => {
      this.fromTokens[t.address] = t;
      if (!this.toTokens[this.network]) this.toTokens[this.network] = {};
      this.toTokens[this.network][t.address] = {
        ...t,
        networkInfo: {
          name: this.network,
          isAddress: (address: string) =>
            Promise.resolve(isEVMAddress(address)),
        },
      };
    });
  }

  static isSupported(network: SupportedNetworkName) {
    return Object.keys(supportedNetworks).includes(
      network as unknown as string
    );
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

  private getZeroXSwap(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    accurateEstimate: boolean
  ): Promise<ZeroXSwapResponse | null> {
    if (
      !ZeroX.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName
      ) ||
      this.network !== options.toToken.networkInfo.name
    )
      return Promise.resolve(null);
    if (options.fromAddress.toLowerCase() !== options.toAddress.toLowerCase())
      // zerox doesnt allow different to address
      return Promise.resolve(null);
    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];
    const params = new URLSearchParams({
      sellToken: options.fromToken.address,
      buyToken: options.toToken.address,
      sellAmount: options.amount.toString(),
      takerAddress: options.fromAddress,
      slippagePercentage: (
        parseFloat(meta.slippage ? meta.slippage : DEFAULT_SLIPPAGE) / 100
      ).toString(),
      buyTokenPercentageFee: feeConfig ? feeConfig.fee.toString() : "0",
      feeRecipient: feeConfig ? feeConfig.referrer : "",
      skipValidation: "true",
      enableSlippageProtection: "false",
      affiliateAddress: feeConfig ? feeConfig.referrer : "",
    });
    return fetch(
      `${BASE_URL}${
        supportedNetworks[this.network].chainId
      }/swap/v1/quote?${params.toString()}`
    )
      .then((res) => res.json())
      .then(async (response: ZeroXResponseType) => {
        if (response.code) {
          console.error(response.code, response.reason);
          return Promise.resolve(null);
        }
        const transactions: EVMTransaction[] = [];

        if (options.fromToken.address !== NATIVE_TOKEN_ADDRESS) {
          const approvalTxs = await getAllowanceTransactions({
            infinityApproval: meta.infiniteApproval,
            spender: supportedNetworks[this.network].approvalAddress,
            web3eth: this.web3eth,
            amount: options.amount,
            fromAddress: options.fromAddress,
            fromToken: options.fromToken,
          });
          transactions.push(...approvalTxs);
        }
        transactions.push({
          from: options.fromAddress,
          gasLimit: GAS_LIMITS.swap,
          to: response.to,
          value: numberToHex(response.value),
          data: response.data,
          type: TransactionType.evm,
        });
        if (accurateEstimate) {
          const accurateGasEstimate = await estimateGasList(
            transactions,
            this.network
          );
          if (accurateGasEstimate) {
            if (accurateGasEstimate.isError) return null;
            transactions.forEach((tx, idx) => {
              tx.gasLimit = accurateGasEstimate.result[idx];
            });
          }
        }
        return {
          transactions,
          toTokenAmount: toBN(response.buyAmount),
          fromTokenAmount: toBN(response.sellAmount),
        };
      });
  }

  getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null> {
    return this.getZeroXSwap(options, meta, false).then(async (res) => {
      if (!res) return null;
      const response: ProviderQuoteResponse = {
        fromTokenAmount: res.fromTokenAmount,
        toTokenAmount: res.toTokenAmount,
        provider: this.name,
        quote: {
          meta,
          options,
          provider: this.name,
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

  getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    return this.getZeroXSwap(quote.options, quote.meta, true).then((res) => {
      if (!res) return null;
      const feeConfig =
        FEE_CONFIGS[this.name][quote.meta.walletIdentifier].fee || 0;
      const response: ProviderSwapResponse = {
        fromTokenAmount: res.fromTokenAmount,
        provider: this.name,
        toTokenAmount: res.toTokenAmount,
        transactions: res.transactions,
        slippage: quote.meta.slippage || DEFAULT_SLIPPAGE,
        fee: feeConfig * 100,
        getStatusObject: async (
          options: StatusOptions
        ): Promise<StatusOptionsResponse> => ({
          options,
          provider: this.name,
        }),
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

export default ZeroX;
