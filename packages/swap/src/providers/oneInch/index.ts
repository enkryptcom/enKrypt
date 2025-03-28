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
import { OneInchResponseType, OneInchSwapResponse } from "./types";
import {
  getAllowanceTransactions,
  TOKEN_AMOUNT_INFINITY_AND_BEYOND,
} from "../../utils/approvals";
import estimateEVMGasList from "../../common/estimateGasList";
import { isEVMAddress } from "../../utils/common";

export const ONEINCH_APPROVAL_ADDRESS =
  "0x111111125421ca6dc452d289314280a0f8842a65";
const supportedNetworks: {
  [key in SupportedNetworkName]?: { approvalAddress: string; chainId: string };
} = {
  [SupportedNetworkName.Ethereum]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "1",
  },
  [SupportedNetworkName.Binance]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "56",
  },
  [SupportedNetworkName.Matic]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "137",
  },
  [SupportedNetworkName.Optimism]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "10",
  },
  [SupportedNetworkName.Avalanche]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "43114",
  },
  [SupportedNetworkName.Fantom]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "250",
  },
  [SupportedNetworkName.Kaia]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "8217",
  },
  [SupportedNetworkName.Aurora]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "1313161554",
  },
  [SupportedNetworkName.Gnosis]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "100",
  },
  [SupportedNetworkName.Arbitrum]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "42161",
  },
  [SupportedNetworkName.Base]: {
    approvalAddress: ONEINCH_APPROVAL_ADDRESS,
    chainId: "8453",
  },
  [SupportedNetworkName.Zksync]: {
    approvalAddress: "0x6fd4383cb451173d5f9304f041c7bcbf27d561ff",
    chainId: "324",
  },
};

const BASE_URL = "https://partners.mewapi.io/oneinch/v6.0/";

class OneInch extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  web3eth: Web3Eth;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  constructor(web3eth: Web3Eth, network: SupportedNetworkName) {
    super();
    this.network = network;
    this.tokenList = [];
    this.web3eth = web3eth;
    this.name = ProviderName.oneInch;
    this.fromTokens = {};
    this.toTokens = {};
  }

  init(tokenList: TokenType[]): Promise<void> {
    if (!OneInch.isSupported(this.network)) return;
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
      network as unknown as string,
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

  private getOneInchSwap(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    accurateEstimate: boolean,
  ): Promise<OneInchSwapResponse | null> {
    if (
      !OneInch.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName,
      ) ||
      this.network !== options.toToken.networkInfo.name
    )
      return Promise.resolve(null);
    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];
    const params = new URLSearchParams({
      src: options.fromToken.address,
      dst: options.toToken.address,
      amount: options.amount.toString(),
      from: options.fromAddress,
      receiver: options.toAddress,
      slippage: meta.slippage ? meta.slippage : DEFAULT_SLIPPAGE,
      fee: feeConfig ? (feeConfig.fee * 100).toFixed(3) : "0",
      referrer: feeConfig ? feeConfig.referrer : "",
      disableEstimate: "true",
    });
    return fetch(
      `${BASE_URL}${
        supportedNetworks[this.network].chainId
      }/swap?${params.toString()}`,
    )
      .then((res) => res.json())
      .then(async (response: OneInchResponseType) => {
        // OneInch gives us the swap transaction info for us to send
        // but we might need to set approvals first so our spender address
        // can perform the swap

        if (response.error) {
          console.error(response.error, response.description);
          return Promise.resolve(null);
        }

        /** Transactions to perform in-order for the swap */
        const transactions: EVMTransaction[] = [];

        if (options.fromToken.address !== NATIVE_TOKEN_ADDRESS) {
          // Prepare to grant our `approvalAddress` approval to spend
          // `fromToken` on behalf of `fromAddress`
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

        // Prepare the actual swap transaction
        transactions.push({
          from: options.fromAddress,
          gasLimit: GAS_LIMITS.swap,
          to: response.tx.to,
          value: numberToHex(response.tx.value),
          data: response.tx.data,
          type: TransactionType.evm,
        });

        if (accurateEstimate) {
          const accurateGasEstimate = await estimateEVMGasList(
            transactions,
            this.network,
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
          toTokenAmount: toBN(response.dstAmount),
          fromTokenAmount: options.amount,
        };
      })
      .catch((e) => {
        console.error(e);
        return Promise.resolve(null);
      });
  }

  getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
  ): Promise<ProviderQuoteResponse | null> {
    return this.getOneInchSwap(options, meta, false).then(async (res) => {
      if (!res) return null;
      const response: ProviderQuoteResponse = {
        fromTokenAmount: res.fromTokenAmount,
        toTokenAmount: res.toTokenAmount,
        additionalNativeFees: toBN(0),
        provider: this.name,
        quote: {
          meta,
          options,
          provider: this.name,
        },
        totalGaslimit: res.transactions.reduce(
          (total: number, curVal: EVMTransaction) =>
            total + toBN(curVal.gasLimit).toNumber(),
          0,
        ),
        minMax: await this.getMinMaxAmount(),
      };
      return response;
    });
  }

  getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    return this.getOneInchSwap(quote.options, quote.meta, true).then((res) => {
      if (!res) return null;
      const feeConfig =
        FEE_CONFIGS[this.name][quote.meta.walletIdentifier].fee || 0;
      const response: ProviderSwapResponse = {
        fromTokenAmount: res.fromTokenAmount,
        provider: this.name,
        toTokenAmount: res.toTokenAmount,
        transactions: res.transactions,
        additionalNativeFees: toBN(0),
        slippage: quote.meta.slippage || DEFAULT_SLIPPAGE,
        fee: feeConfig * 100,
        getStatusObject: async (
          options: StatusOptions,
        ): Promise<StatusOptionsResponse> => ({
          options,
          provider: this.name,
        }),
      };
      return response;
    });
  }

  getStatus(options: StatusOptions): Promise<TransactionStatus> {
    const promises = options.transactions.map(({ hash }) =>
      this.web3eth.getTransactionReceipt(hash),
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
