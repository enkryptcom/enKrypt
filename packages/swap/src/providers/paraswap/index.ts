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
import {
  ParaSwapSwapResponse,
  ParaswapResponseType,
  ParaswpQuoteResponse,
} from "./types";
import {
  getAllowanceTransactions,
  TOKEN_AMOUNT_INFINITY_AND_BEYOND,
} from "../../utils/approvals";
import estimateGasList from "../../common/estimateGasList";
import { isEVMAddress } from "../../utils/common";

export const PARASWAP_APPROVAL_ADDRESS =
  "0x216b4b4ba9f3e719726886d34a177484278bfcae";

const supportedNetworks: {
  [key in SupportedNetworkName]?: { approvalAddress: string; chainId: string };
} = {
  [SupportedNetworkName.Ethereum]: {
    approvalAddress: PARASWAP_APPROVAL_ADDRESS,
    chainId: "1",
  },
  [SupportedNetworkName.Binance]: {
    approvalAddress: PARASWAP_APPROVAL_ADDRESS,
    chainId: "56",
  },
  [SupportedNetworkName.Matic]: {
    approvalAddress: PARASWAP_APPROVAL_ADDRESS,
    chainId: "137",
  },
  [SupportedNetworkName.Avalanche]: {
    approvalAddress: PARASWAP_APPROVAL_ADDRESS,
    chainId: "43114",
  },
  [SupportedNetworkName.Fantom]: {
    approvalAddress: PARASWAP_APPROVAL_ADDRESS,
    chainId: "250",
  },
  [SupportedNetworkName.Arbitrum]: {
    approvalAddress: PARASWAP_APPROVAL_ADDRESS,
    chainId: "42161",
  },
};

const BASE_URL = "https://apiv5.paraswap.io/";

class ParaSwap extends ProviderClass {
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
    this.name = ProviderName.paraswap;
    this.fromTokens = {};
    this.toTokens = {};
  }

  init(tokenList: TokenType[]): Promise<void> {
    if (!ParaSwap.isSupported(this.network)) return;
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

  private getParaswapSwap(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    accurateEstimate: boolean
  ): Promise<ParaSwapSwapResponse | null> {
    if (
      !ParaSwap.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName
      ) ||
      this.network !== options.toToken.networkInfo.name
    )
      return Promise.resolve(null);
    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];
    const params = new URLSearchParams({
      ignoreChecks: "true",
      ignoreGasEstimate: "true",
      onlyParams: "false",
    });
    const body = JSON.stringify({
      srcToken: options.fromToken.address,
      srcDecimals: options.fromToken.decimals.toString(),
      destToken: options.toToken.address,
      destDecimals: options.toToken.decimals.toString(),
      srcAmount: options.amount.toString(),
      priceRoute: meta.priceRoute!,
      userAddress: options.fromAddress,
      txOrigin: options.fromAddress,
      receiver: options.toAddress,
      slippage: parseInt(
        (
          parseFloat(meta.slippage ? meta.slippage : DEFAULT_SLIPPAGE) * 10
        ).toString(),
        10
      ).toString(),
      deadline: Math.floor(Date.now() / 1000) + 300,
      partnerAddress: feeConfig ? feeConfig.referrer : "",
      partnerFeeBps: feeConfig
        ? parseInt((feeConfig.fee * 10000).toString(), 10).toString()
        : "0",
    });
    return fetch(
      `${BASE_URL}transactions/${
        supportedNetworks[this.network].chainId
      }?${params.toString()}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body,
      }
    )
      .then((res) => res.json())
      .then(async (response: ParaswapResponseType) => {
        if (response.error) {
          console.error(response.error);
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
          toTokenAmount: toBN(
            (meta.priceRoute as ParaswpQuoteResponse).destAmount
          ),
          fromTokenAmount: toBN(
            (meta.priceRoute as ParaswpQuoteResponse).srcAmount
          ),
        };
      });
  }

  getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null> {
    if (
      !ParaSwap.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName
      ) ||
      this.network !== options.toToken.networkInfo.name
    )
      return Promise.resolve(null);
    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];
    const params = new URLSearchParams({
      srcToken: options.fromToken.address,
      srcDecimals: options.fromToken.decimals.toString(),
      destToken: options.toToken.address,
      destDecimals: options.toToken.decimals.toString(),
      amount: options.amount.toString(),
      side: "SELL",
      network: supportedNetworks[this.network].chainId,
      userAddress: options.fromAddress,
      receiver: options.toAddress,
      partnerAddress: feeConfig ? feeConfig.referrer : "",
      partnerFeeBps: feeConfig
        ? parseInt((feeConfig.fee * 10000).toString(), 10).toString()
        : "0",
    });
    return fetch(`${BASE_URL}prices?${params.toString()}`)
      .then((j) => j.json())
      .then(async (jsonRes) => {
        if (!jsonRes) return null;
        const res: ParaswpQuoteResponse = jsonRes.priceRoute;
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
        const response: ProviderQuoteResponse = {
          fromTokenAmount: toBN(res.srcAmount),
          toTokenAmount: toBN(res.destAmount),
          provider: this.name,
          quote: {
            meta: {
              ...meta,
              priceRoute: res,
            },
            options,
            provider: this.name,
          },
          totalGaslimit:
            transactions.reduce(
              (total: number, curVal: EVMTransaction) =>
                total + toBN(curVal.gasLimit).toNumber(),
              0
            ) + toBN(GAS_LIMITS.swap).toNumber(),
          minMax: await this.getMinMaxAmount(),
        };
        return response;
      });
  }

  getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    return this.getParaswapSwap(quote.options, quote.meta, true).then((res) => {
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

export default ParaSwap;
