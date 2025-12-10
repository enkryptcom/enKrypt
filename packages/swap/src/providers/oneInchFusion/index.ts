import type Web3Eth from "web3-eth";
import BigNumber from "bignumber.js";
import { toBN } from "web3-utils";
import {
  Address,
  FusionSDK,
  QuoteParams,
  RelayerRequest,
  CHAIN_TO_WRAPPER,
  OrderStatus,
} from "@1inch/fusion-sdk";
import { Bps } from "@1inch/limit-order-sdk";
import {
  EVMTransaction,
  getQuoteOptions,
  MinMaxResponse,
  ProviderFromTokenResponse,
  ProviderName,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  ProviderToTokenResponse,
  ProviderWithRFQ,
  QuoteMetaOptions,
  RFQOptions,
  RFQOptionsResponse,
  StatusOptions,
  StatusOptionsResponse,
  SupportedNetworkName,
  SwapQuote,
  SwapType,
  TokenType,
  TransactionStatus,
} from "../../types";
import {
  DEFAULT_SLIPPAGE,
  FEE_CONFIGS,
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";
import { OneInchSwapResponse } from "./types";
import {
  getAllowanceTransactions,
  getNativeWrapTx,
  isSufficientWrappedAvailable,
  TOKEN_AMOUNT_INFINITY_AND_BEYOND,
} from "../../utils/approvals";
import estimateEVMGasList from "../../common/estimateGasList";
import { isEVMAddress } from "../../utils/common";
import { supportedNetworks } from "../oneInch";
import SwapToken from "../../swapToken";

class OneInchFusion extends ProviderWithRFQ {
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
    let isFromNative = false;
    if (
      options.fromToken.address.toLowerCase() ===
      NATIVE_TOKEN_ADDRESS.toLowerCase()
    )
      isFromNative = true;

    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];
    const chainId = Number(supportedNetworks[this.network].chainId);
    const quoteParams: QuoteParams = {
      amount: options.amount.toString(),
      fromTokenAddress: isFromNative
        ? CHAIN_TO_WRAPPER[chainId].toString()
        : options.fromToken.address,
      toTokenAddress: options.toToken.address,
      enableEstimate: false,
      isPermit2: false,
    };
    if (feeConfig) {
      quoteParams.source = meta.walletIdentifier;
      quoteParams.integratorFee = {
        receiver: new Address(feeConfig.referrer),
        value: new Bps(BigInt(feeConfig.fee)),
        share: Bps.fromPercent(100),
      };
    }
    return this.fusionSdk
      .getQuote(quoteParams)
      .then(async (quote) => {
        const order = await this.fusionSdk.createOrder({
          ...quoteParams,
          preset: quote.recommendedPreset,
          walletAddress: options.fromAddress,
          receiver: options.toAddress,
          slippage: meta.slippage
            ? Number(meta.slippage)
            : Number(DEFAULT_SLIPPAGE),
        });
        const transactions: EVMTransaction[] = [];
        const approvalTxs = await getAllowanceTransactions({
          infinityApproval: meta.infiniteApproval,
          spender: supportedNetworks[this.network].approvalAddress,
          web3eth: this.web3eth,
          amount: options.amount,
          fromAddress: options.fromAddress,
          fromToken: isFromNative
            ? { address: CHAIN_TO_WRAPPER[chainId].toString() }
            : options.fromToken,
        });
        transactions.push(...approvalTxs);
        if (isFromNative) {
          const isEnoughWrapped = await isSufficientWrappedAvailable(
            {
              from: options.fromAddress,
              contract: CHAIN_TO_WRAPPER[chainId].toString(),
              value: options.amount,
            },
            this.web3eth,
          );
          if (!isEnoughWrapped) {
            transactions.push(
              getNativeWrapTx({
                from: options.fromAddress,
                contract: CHAIN_TO_WRAPPER[chainId].toString(),
                value: options.amount,
              }),
            );
          }
        }
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
        const orderStruct = order.order.build();
        const typedMessage = order.order.getTypedData(chainId);
        return {
          transactions,
          typedMessages: [JSON.stringify(typedMessage)],
          toTokenAmount: toBN(
            quote.presets[quote.recommendedPreset].auctionEndAmount.toString(),
          ),
          fromTokenAmount: options.amount,
          orderStruct: JSON.stringify(orderStruct),
          quoteId: order.quoteId,
          orderHash: order.hash,
          extension: order.order.extension.encode(),
          fromUSDValue: quote.prices.usd.fromToken,
        };
      })
      .catch(() => {
        return null;
      });
  }

  getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
  ): Promise<ProviderQuoteResponse | null> {
    return this.getOneInchSwap(options, meta, false).then(async (res) => {
      if (!res) return null;
      const minMax = await this.getMinMaxAmount();
      const fromUSDValue = res.fromUSDValue;
      const fromToken = new SwapToken(options.fromToken);
      const minFrom = fromToken.toRaw(
        new BigNumber(1)
          .div(Number(fromUSDValue) / 10)
          .toFixed(fromToken.token.decimals),
      ); // minimum $10 worth of tokens
      minMax.minimumFrom = minFrom;
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
        minMax,
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
        type: SwapType.rfq,
        toTokenAmount: res.toTokenAmount,
        transactions: res.transactions,
        typedMessages: res.typedMessages,
        additionalNativeFees: toBN(0),
        slippage: quote.meta.slippage || DEFAULT_SLIPPAGE,
        fee: feeConfig / 100,
        getRFQObject: async (): Promise<RFQOptionsResponse> => ({
          options: {
            orderStruct: res.orderStruct,
            orderHash: res.orderHash,
            quoteId: res.quoteId,
            extension: res.extension,
          },
          provider: this.name,
        }),
        getStatusObject: async (
          options: StatusOptions,
        ): Promise<StatusOptionsResponse> => ({
          options: { ...options, orderHash: res.orderHash },
          provider: this.name,
        }),
      };
      return response;
    });
  }

  getStatus(options: StatusOptions): Promise<TransactionStatus> {
    return this.fusionSdk.getOrderStatus(options.orderHash).then((status) => {
      if (status.status === OrderStatus.Filled)
        return TransactionStatus.success;
      if (status.status === OrderStatus.Pending)
        return TransactionStatus.pending;
      else {
        return TransactionStatus.failed;
      }
    });
  }

  submitRFQOrder(options: RFQOptions): Promise<string> {
    if (!options.signatures || !options.signatures.length)
      throw new Error("OneInchFusion: No signatures found");
    const relayRequest = RelayerRequest.new({
      order: JSON.parse((options as any).orderStruct),
      extension: (options as any).extension,
      quoteId: (options as any).quoteId,
      signature: options.signatures[0],
    });
    return this.fusionSdk.api.submitOrder(relayRequest).then(() => {
      return (options as any).orderHash as string;
    });
  }
}

export default OneInchFusion;
