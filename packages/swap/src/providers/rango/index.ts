import type Web3Eth from "web3-eth";
import { numberToHex, toBN } from "web3-utils";
import {
  EvmTransaction as RangoEvmTransaction,
  RangoClient,
  TransactionStatus as RangoTransactionStatus,
  MetaResponse,
  SwapRequest,
  BlockchainMeta,
  RoutingResultType,
} from "rango-sdk-basic";
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
import { RangoSwapResponse } from "./types";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "../../utils/approvals";
import estimateGasList from "../../common/estimateGasList";
import { isEVMAddress } from "../../utils/common";

const RANGO_PUBLIC_API_KEY = "ee7da377-0ed8-4d42-aaf9-fa978a32b18d";
const rangoClient = new RangoClient(RANGO_PUBLIC_API_KEY);
const supportedNetworks: {
  [key in SupportedNetworkName]?: { chainId: string; name: string };
} = {
  [SupportedNetworkName.Ethereum]: {
    chainId: "1",
    name: "ETH",
  },
  [SupportedNetworkName.Binance]: {
    chainId: "56",
    name: "BSC",
  },
  [SupportedNetworkName.Matic]: {
    chainId: "137",
    name: "POLYGON",
  },
  [SupportedNetworkName.Optimism]: {
    chainId: "10",
    name: "OPTIMISM",
  },
  [SupportedNetworkName.Avalanche]: {
    chainId: "43114",
    name: "AVAX_CCHAIN",
  },
  [SupportedNetworkName.Fantom]: {
    chainId: "250",
    name: "FANTOM",
  },
  [SupportedNetworkName.Aurora]: {
    chainId: "1313161554",
    name: "AURORA",
  },
  [SupportedNetworkName.Gnosis]: {
    chainId: "100",
    name: "GNOSIS",
  },
  [SupportedNetworkName.Arbitrum]: {
    chainId: "42161",
    name: "ARBITRUM",
  },
  [SupportedNetworkName.Moonbeam]: {
    chainId: "1284",
    name: "MOONBEAM",
  },
};

class Rango extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  web3eth: Web3Eth;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  rangoMeta: MetaResponse;

  transactionsStatus: { hash: string; status: RangoTransactionStatus }[];

  constructor(web3eth: Web3Eth, network: SupportedNetworkName) {
    super(web3eth, network);
    this.network = network;
    this.tokenList = [];
    this.web3eth = web3eth;
    this.name = ProviderName.rango;
    this.fromTokens = {};
    this.toTokens = {};
    this.rangoMeta = { blockchains: [], tokens: [], swappers: [] };
    this.transactionsStatus = [];
  }

  init(tokenList?: TokenType[]): Promise<void> {
    const rangoToNetwork: Record<string, SupportedNetworkName> = {};
    Object.keys(supportedNetworks).forEach((net) => {
      rangoToNetwork[supportedNetworks[net].name] =
        net as unknown as SupportedNetworkName;
    });
    const supportedCRangoNames = Object.values(supportedNetworks).map(
      (s) => s.name
    );
    return rangoClient.meta().then((resMeta) => {
      this.rangoMeta = resMeta;
      const { blockchains } = resMeta;
      if (!Rango.isSupported(this.network, blockchains)) return;

      tokenList?.forEach((t) => {
        if (
          this.isNativeToken(t.address) ||
          resMeta.tokens.find((token) => token.address === t.address)
        ) {
          this.fromTokens[t.address] = t;
          blockchains.forEach((chain) => {
            if (!supportedCRangoNames.includes(chain.name)) return;
            if (!this.toTokens[rangoToNetwork[chain.name]])
              this.toTokens[rangoToNetwork[chain.name]] = {};
            this.toTokens[rangoToNetwork[chain.name]][t.address] = {
              ...t,
              networkInfo: {
                name: rangoToNetwork[chain.name],
                isAddress: (address: string) =>
                  Promise.resolve(isEVMAddress(address)),
              },
            };
          });
        }
      });
    });
  }

  static isSupported(
    network: SupportedNetworkName,
    blockchains: BlockchainMeta[]
  ) {
    if (!Object.keys(supportedNetworks).includes(network as unknown as string))
      return false;
    if (blockchains.length) {
      const { chainId } = Object.entries(supportedNetworks).find(
        (chain) => chain[0] === (network as unknown as string)
      )[1];
      return !!blockchains.find(
        (chain: BlockchainMeta) => chain.chainId === chainId
      )?.enabled;
    }
    return true;
  }

  getFromTokens() {
    return this.fromTokens;
  }

  getToTokens() {
    return this.toTokens;
  }

  private isNativeToken(address: string) {
    return NATIVE_TOKEN_ADDRESS === address;
  }

  getMinMaxAmount(): Promise<MinMaxResponse> {
    return Promise.resolve({
      minimumFrom: toBN("1"),
      maximumFrom: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
      minimumTo: toBN("1"),
      maximumTo: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
    });
  }

  private getRangoSwap(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    accurateEstimate: boolean
  ): Promise<RangoSwapResponse | null> {
    const { blockchains } = this.rangoMeta;
    if (
      !Rango.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName,
        blockchains
      ) ||
      !Rango.isSupported(this.network, blockchains)
    )
      return Promise.resolve(null);
    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];
    const fromBlockchain = blockchains.find(
      (chain) =>
        Number(chain.chainId) ===
        Number(supportedNetworks[this.network].chainId)
    )?.name;
    const toBlockchain = blockchains.find(
      (chain) =>
        Number(chain.chainId) ===
        Number(supportedNetworks[options.toToken.networkInfo.name].chainId)
    )?.name;
    const fromTokenAddress = options.fromToken.address;
    const toTokenAddress = options.toToken.address;
    const params: SwapRequest = {
      from: {
        address: !this.isNativeToken(fromTokenAddress)
          ? fromTokenAddress
          : null,
        blockchain: fromBlockchain,
        symbol: options.fromToken.symbol,
      },
      to: {
        address: !this.isNativeToken(toTokenAddress) ? toTokenAddress : null,
        blockchain: toBlockchain,
        symbol: options.toToken.symbol,
      },
      amount: options.amount.toString(),
      fromAddress: options.fromAddress,
      toAddress: options.toAddress,
      slippage: meta.slippage || DEFAULT_SLIPPAGE,
      referrerFee: feeConfig ? (feeConfig.fee * 100).toFixed(3) : undefined,
      referrerAddress: feeConfig?.referrer || undefined,
      disableEstimate: true,
    };
    return rangoClient.swap(params).then(async (response) => {
      if (response.error || response.resultType !== RoutingResultType.OK) {
        console.error(response.error);
        return Promise.resolve(null);
      }
      const tx = response.tx as RangoEvmTransaction;
      const transactions: EVMTransaction[] = [];
      if (!this.isNativeToken(options.fromToken.address) && tx.approveTo) {
        const approvalTxs: EVMTransaction[] = [
          {
            from: tx.from,
            data: tx.approveData,
            gasLimit: GAS_LIMITS.approval,
            to: tx.approveTo,
            value: tx.value || "0x0",
            type: TransactionType.evm,
          },
        ];
        transactions.push(...approvalTxs);
      }

      transactions.push({
        from: options.fromAddress,
        gasLimit: tx.gasLimit || GAS_LIMITS.swap,
        to: tx.txTo,
        value: numberToHex(tx.value),
        data: tx.txData,
        type: TransactionType.evm,
      });
      if (accurateEstimate) {
        const accurateGasEstimate = await estimateGasList(
          transactions,
          this.network
        );
        if (accurateGasEstimate) {
          if (accurateGasEstimate.isError) return null;
          transactions.forEach((transaction, idx) => {
            transaction.gasLimit = accurateGasEstimate.result[idx];
          });
        }
      }
      return {
        transactions,
        toTokenAmount: toBN(response.route.outputAmount),
        fromTokenAmount: toBN(options.amount.toString()),
        requestId: response.requestId,
      };
    });
  }

  getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null> {
    return this.getRangoSwap(options, meta, false).then(async (res) => {
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
    return this.getRangoSwap(quote.options, quote.meta, true).then((res) => {
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
          options: {
            ...options,
            requestId: res.requestId,
          },
          provider: this.name,
        }),
      };

      return response;
    });
  }

  getStatus(options: StatusOptions): Promise<TransactionStatus> {
    const { requestId, transactionHashes } = options;
    const transactionHash =
      transactionHashes.length > 0
        ? transactionHashes[transactionHashes.length - 1]
        : transactionHashes[0];
    const isAlreadySuccessOrFailed = [
      RangoTransactionStatus.FAILED,
      RangoTransactionStatus.SUCCESS,
    ].includes(
      this.transactionsStatus.find((t) => t.hash === transactionHash)?.status
    );
    if (requestId && !isAlreadySuccessOrFailed) {
      return rangoClient
        .status({
          txId: transactionHash,
          requestId,
        })
        .then((res) => {
          if (res.error || res.status === RangoTransactionStatus.FAILED) {
            this.transactionsStatus.push({
              status: RangoTransactionStatus.FAILED,
              hash: transactionHash,
            });
            return TransactionStatus.failed;
          }
          if (!res.status || res.status === RangoTransactionStatus.RUNNING) {
            return TransactionStatus.pending;
          }
          this.transactionsStatus.push({
            status: RangoTransactionStatus.SUCCESS,
            hash: transactionHash,
          });
          return TransactionStatus.success;
        });
    }
    const promises = transactionHashes.map((hash) =>
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

export default Rango;
