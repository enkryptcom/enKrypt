import type Web3Eth from "web3-eth";
import { toBN } from "web3-utils";
import { Address, FusionSDK, QuoteParams } from "@1inch/fusion-sdk";
import { Bps } from "@1inch/limit-order-sdk";
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
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";
import { OneInchSwapResponse } from "./types";
import {
  getAllowanceTransactions,
  TOKEN_AMOUNT_INFINITY_AND_BEYOND,
} from "../../utils/approvals";
import estimateEVMGasList from "../../common/estimateGasList";
import { isEVMAddress } from "../../utils/common";
import { supportedNetworks } from "../oneInch";

class OneInchFusion extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  web3eth: Web3Eth;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  fusionSdk: FusionSDK;

  constructor(web3eth: Web3Eth, network: SupportedNetworkName) {
    super();
    this.network = network;
    this.tokenList = [];
    this.web3eth = web3eth;
    this.name = ProviderName.oneInchFusion;
    this.fromTokens = {};
    this.toTokens = {};
  }

  init(tokenList: TokenType[]): Promise<void> {
    if (!OneInchFusion.isSupported(this.network)) return;
    this.fusionSdk = new FusionSDK({
      network: Number(supportedNetworks[this.network].chainId),
      url: "https://fusion.1inch.io",
    });
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
      !OneInchFusion.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName,
      ) ||
      this.network !== options.toToken.networkInfo.name
    )
      return Promise.resolve(null);
    if (
      options.fromAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
    )
      return Promise.resolve(null);

    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];
    const quoteParams: QuoteParams = {
      amount: options.amount.toString(),
      fromTokenAddress: options.fromToken.address,
      toTokenAddress: options.toToken.address,
      enableEstimate: false,
      isPermit2: false,
    };
    if (feeConfig) {
      quoteParams.source = meta.walletIdentifier;
      quoteParams.integratorFee = {
        receiver: new Address(feeConfig.referrer),
        value: Bps.fromPercent(Math.floor(feeConfig.fee * 100)),
        share: Bps.fromPercent(100),
      };
    }
    return this.fusionSdk
      .getQuote(quoteParams)
      .then(async (quote) => {
        const transactions: EVMTransaction[] = [];
        const approvalTxs = await getAllowanceTransactions({
          infinityApproval: meta.infiniteApproval,
          spender: supportedNetworks[this.network].approvalAddress,
          web3eth: this.web3eth,
          amount: options.amount,
          fromAddress: options.fromAddress,
          fromToken: options.fromToken,
        });
        transactions.push(...approvalTxs);
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
        const chainId = Number(supportedNetworks[this.network].chainId);
        const fusionOrder = quote.createFusionOrder({
          network: chainId,
          preset: quote.recommendedPreset,
          receiver: new Address(options.toAddress),
        });
        const orderStruct = fusionOrder.build();
        const typedMessage = fusionOrder.getTypedData(chainId);
        const typeTx: EVMTransaction = {
          data: JSON.stringify(typedMessage),
          from: "",
          gasLimit: "0",
          to: "",
          type: TransactionType.typedMessage,
          value: "0",
        };
        transactions.push(typeTx);
        return {
          transactions,
          toTokenAmount: toBN(
            quote.presets[quote.recommendedPreset].auctionEndAmount.toString(),
          ),
          fromTokenAmount: options.amount,
          orderStruct: JSON.stringify(orderStruct),
          quoteId: quote.quoteId,
          orderHash: fusionOrder.getOrderHash(chainId),
        };
      })
      .catch((e) => {
        console.error(e);
        return null;
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
          options: {
            ...options,
            orderStruct: res.orderStruct,
            orderHash: res.orderHash,
            quoteId: res.quoteId,
          },
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

export default OneInchFusion;
