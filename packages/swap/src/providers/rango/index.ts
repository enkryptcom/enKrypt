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
  TransactionType as RangoTransactionType,
} from "rango-sdk-basic";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { extractComputeBudget } from "../../utils/solana";
import {
  EVMTransaction,
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
import { RangoNetworkedTransactions, RangoSwapResponse } from "./types";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "../../utils/approvals";
import estimateEVMGasList from "../../common/estimateGasList";
import { isEVMAddress } from "../../utils/common";

const RANGO_PUBLIC_API_KEY = "ee7da377-0ed8-4d42-aaf9-fa978a32b18d";
const rangoClient = new RangoClient(RANGO_PUBLIC_API_KEY);

/**
 * `name` is the blockchain id on Rango
 *
 * You can use the Rango API to get a list of tokens to figure out the Rango name of a network
 *
 * @see https://rango-api.readme.io/reference/meta
 *
 * ```sh
 * curl 'https://api.rango.exchange/basic/meta?apiKey=c6381a79-2817-4602-83bf-6a641a409e32' -H 'Accept:application/json'
 * ```
 */
const supportedNetworks: {
  [key in SupportedNetworkName]?: {
    /** Standard base10 chain ID, can be obtained from `https://chainlist.org` */
    chainId: string;
    /** Rango name (Rango's identifier for the chain) of a network */
    name: string;
  };
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
  [SupportedNetworkName.Solana]: {
    chainId: "900", // Doesn't match with Rango, their chainId value for this is "mainnet-beta"
    name: "SOLANA",
  },
  [SupportedNetworkName.Blast]: {
    chainId: "81457",
    name: "BLAST",
  },
  [SupportedNetworkName.Telos]: {
    chainId: "40",
    name: "TELOS",
  },
};

class Rango extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  web3: Web3Eth | Connection;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  rangoMeta: MetaResponse;

  transactionsStatus: { hash: string; status: RangoTransactionStatus }[];

  constructor(web3: Web3Eth | Connection, network: SupportedNetworkName) {
    super();
    this.network = network;
    this.tokenList = [];
    this.web3 = web3;
    this.name = ProviderName.rango;
    this.fromTokens = {};
    this.toTokens = {};
    this.rangoMeta = { blockchains: [], tokens: [], swappers: [] };
    this.transactionsStatus = [];
  }

  async init(tokenList?: TokenType[]): Promise<void> {
    const resMeta = await rangoClient.meta({
      excludeNonPopulars: true,
      transactionTypes: [RangoTransactionType.EVM, RangoTransactionType.SOLANA],
    });
    this.rangoMeta = resMeta;
    const { blockchains, tokens } = resMeta;
    if (!Rango.isSupported(this.network, blockchains)) {
      return;
    }
    tokenList?.forEach((t) => {
      const tokenSupport = tokens.find((token) => token.address === t.address);
      if (this.isNativeToken(t.address) || tokenSupport) {
        this.fromTokens[t.address] = t;
      }
    });
  }

  static isSupported(
    network: SupportedNetworkName,
    blockchains: BlockchainMeta[]
  ) {
    // We must support this network
    if (
      !Object.keys(supportedNetworks).includes(network as unknown as string)
    ) {
      return false;
    }

    if (blockchains.length) {
      // Join Rango networks and our supported networks by their chain id

      // Extract our info about this supported network
      const { chainId } = Object.entries(supportedNetworks).find(
        (chain) => chain[0] === (network as unknown as string)
      )[1];
      const enabled = !!blockchains.find(
        // Sometimes Rango chainId will be a number, sometimes it'll be something else
        // for example they use "mainnet-beta" for Solana but for most (all?) EVM it
        // has an 0x prefixed hex number
        (chain: BlockchainMeta) => {
          if (Number(chain.chainId) === Number(chainId)) return true;
          if (
            network === SupportedNetworkName.Solana &&
            chain.name === "SOLANA" &&
            chain.chainId === "mainnet-beta"
          )
            return true;
          return false;
        }
      )?.enabled;
      return enabled;
    }

    // Rango didn't give us anything so just assume Rango supports this network
    return true;
  }

  getFromTokens() {
    return this.fromTokens;
  }

  getToTokens() {
    const { tokens } = this.rangoMeta;
    const supportedCRangoNames = Object.values(supportedNetworks).map(
      (s) => s.name
    );
    const rangoToNetwork: Record<string, SupportedNetworkName> = {};
    Object.keys(supportedNetworks).forEach((net) => {
      rangoToNetwork[supportedNetworks[net].name] =
        net as unknown as SupportedNetworkName;
    });
    tokens?.forEach((t) => {
      if (!supportedCRangoNames.includes(t.blockchain)) return;
      if (!this.toTokens[rangoToNetwork[t.blockchain]])
        this.toTokens[rangoToNetwork[t.blockchain]] = {};
      this.toTokens[rangoToNetwork[t.blockchain]][
        t.address || NATIVE_TOKEN_ADDRESS
      ] = {
        ...t,
        name: t.name || t.symbol,
        logoURI: t.image,
        type: NetworkType.EVM,
        price: t.usdPrice,
        networkInfo: {
          name: rangoToNetwork[t.blockchain],
          isAddress: (address: string) =>
            Promise.resolve(isEVMAddress(address)),
        },
      };
    });

    return this.toTokens;
  }

  /**
   * Returns the symbol in Rango's specific form from the meta information.
   * For cross-chain tokens like Ethereum (ETH) on the Binance Smart Chain (BSC) network,
   * it returns the corresponding symbol like WETH.
   */
  private getSymbol(token: TokenType) {
    const { tokens } = this.rangoMeta;
    if (this.isNativeToken(token.address)) return token.symbol;
    return Object.values(tokens || []).find(
      (t) => t.address?.toLowerCase() === token.address?.toLowerCase()
    )?.symbol;
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

  private async getRangoSwap(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    accurateEstimate: boolean
  ): Promise<RangoSwapResponse | null> {
    const { blockchains } = this.rangoMeta;

    // Determine whether Enkrypt + Rango supports this swap

    // Do we support Rango on this network?
    if (
      !Rango.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName,
        blockchains
      ) ||
      !Rango.isSupported(this.network, blockchains)
    )
      return Promise.resolve(null);

    // Does Rango support these tokens?
    const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];

    /** Source token Rango blockchain name */
    const fromBlockchain = blockchains.find((chain) => {
      // Chain id matches
      if (
        Number(chain.chainId) ===
        Number(supportedNetworks[this.network].chainId)
      )
        return true;
      // It's Solana
      if (
        this.network === SupportedNetworkName.Solana &&
        chain.name === "SOLANA" &&
        chain.chainId === "mainnet-beta"
      )
        return true;
      // No match
      return false;
    })?.name;

    /** Destination token Rango blockchain name */
    const toBlockchain = blockchains.find((chain) => {
      // Chain id matchecs
      if (
        Number(chain.chainId) ===
        Number(supportedNetworks[options.toToken.networkInfo.name].chainId)
      )
        return true;
      // It's Solana
      if (
        options.toToken.networkInfo.name === SupportedNetworkName.Solana &&
        chain.name === "SOLANA" &&
        chain.chainId === "mainnet-beta"
      )
        return true;
      // No match
      return false;
    })?.name;

    const fromTokenAddress = options.fromToken.address;
    const toTokenAddress = options.toToken.address;

    /** Source token symbol */
    const fromSymbol = this.getSymbol(options.fromToken);

    /** Destination token symbol */
    const toSymbol = this.getSymbol(options.toToken);

    // If we can't get symbols for the tokens then we don't support them
    if (!fromSymbol || !toSymbol) return Promise.resolve(null);

    // Enkrypt & Rango both likely support this swap (pair & networks)

    // Request a swap transaction from Rango for the pair & networks
    const params: SwapRequest = {
      from: {
        address: !this.isNativeToken(fromTokenAddress)
          ? fromTokenAddress
          : null,
        blockchain: fromBlockchain,
        symbol: fromSymbol,
      },
      to: {
        address: !this.isNativeToken(toTokenAddress) ? toTokenAddress : null,
        blockchain: toBlockchain,
        symbol: toSymbol,
      },
      amount: options.amount.toString(),
      fromAddress: options.fromAddress,
      toAddress: options.toAddress,
      slippage: meta.slippage || DEFAULT_SLIPPAGE,
      referrerFee: feeConfig ? (feeConfig.fee * 100).toFixed(3) : undefined,
      referrerAddress: feeConfig?.referrer || undefined,
      disableEstimate: true,
    };

    const rangoSwapResponse = await rangoClient.swap(params);

    if (
      rangoSwapResponse.error ||
      rangoSwapResponse.resultType !== RoutingResultType.OK
    ) {
      // Rango experienced some kind of error or is unable to route the swap
      console.error(rangoSwapResponse.error);
      return Promise.resolve(null);
    }

    // We have a swap transaction provided by Rango that can be executed

    // Note additional routing fees
    let additionalNativeFees = toBN(0);
    rangoSwapResponse.route.fee.forEach((f) => {
      if (
        !f.token.address &&
        f.expenseType === "FROM_SOURCE_WALLET" &&
        f.name !== "Network Fee"
      ) {
        additionalNativeFees = additionalNativeFees.add(toBN(f.amount));
      }
    });

    // Fill in gas values, add approval transactions, etc
    let networkTransactions: RangoNetworkedTransactions;

    switch (rangoSwapResponse.tx?.type) {
      // Process Rango swap Solana transaction
      case RangoTransactionType.SOLANA: {
        let versionedTransaction: VersionedTransaction;
        if (rangoSwapResponse.tx.serializedMessage == null) {
          // TODO: when and why does this happen?
          throw new Error(
            `Rango did not return a serialized message for the Solana transaction`
          );
        }
        switch (rangoSwapResponse.tx.txType) {
          case "VERSIONED": {
            versionedTransaction = VersionedTransaction.deserialize(
              new Uint8Array(rangoSwapResponse.tx.serializedMessage)
            );
            break;
          }
          case "LEGACY": {
            // TODO: does this work? versionedTransaction.version has type `'legacy' | 0` so maybe?
            versionedTransaction = VersionedTransaction.deserialize(
              new Uint8Array(rangoSwapResponse.tx.serializedMessage)
            );
            break;
          }
          default:
            rangoSwapResponse.tx.txType satisfies never;
            throw new Error(
              `Unhandled Rango Solana transaction type: ${rangoSwapResponse.tx.txType}`
            );
        }

        networkTransactions = {
          type: NetworkType.Solana,
          transactions: [
            {
              type: TransactionType.solana,
              from: rangoSwapResponse.tx.from,
              // TODO: is this right?
              to: options.toToken.address,
              serialized: Buffer.from(
                versionedTransaction.serialize()
              ).toString("base64"),
            },
          ],
        };
        break;
      }

      // Process Rango swap EVM transaction
      case RangoTransactionType.EVM: {
        const transactions: EVMTransaction[] = [];

        // TODO: handle Solana transactions
        const tx = rangoSwapResponse.tx as RangoEvmTransaction;
        if (!this.isNativeToken(options.fromToken.address) && tx.approveTo) {
          // The user needss to approve Rango to swap tokens on their behalf
          const approvalTx: EVMTransaction = {
            from: tx.from,
            data: tx.approveData,
            gasLimit: GAS_LIMITS.approval,
            to: tx.approveTo,
            value: tx.value || "0x0",
            type: TransactionType.evm,
          };
          transactions.push(approvalTx);
        }

        // Stage the swap transaction
        transactions.push({
          from: options.fromAddress,
          gasLimit: tx.gasLimit || GAS_LIMITS.swap,
          to: tx.txTo,
          value: numberToHex(tx.value),
          data: tx.txData,
          type: TransactionType.evm,
        });

        if (accurateEstimate) {
          // Get accurate gas limits for each transactions
          const accurateGasEstimate = await estimateEVMGasList(
            transactions,
            this.network
          );
          if (accurateGasEstimate) {
            // Something went wrong estimating gas value, bail on the swap request
            if (accurateGasEstimate.isError) return null;
            // Update each transaction with their accurate gas limit
            transactions.forEach((transaction, idx) => {
              transaction.gasLimit = accurateGasEstimate.result[idx];
            });
          }
        }

        networkTransactions = { type: NetworkType.EVM, transactions };
        break;
      }

      case undefined:
      case null: {
        throw new Error(`Rango did not return a transaction type`);
      }

      default: {
        throw new Error(
          `Unhandled Rango transaction type: ${rangoSwapResponse.tx.type}`
        );
      }
    }

    const result: RangoSwapResponse = {
      networkTransactions,
      toTokenAmount: toBN(rangoSwapResponse.route.outputAmount),
      fromTokenAmount: toBN(options.amount.toString()),
      additionalNativeFees,
      requestId: rangoSwapResponse.requestId,
    };

    return result;
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions
  ): Promise<ProviderQuoteResponse | null> {
    const res = await this.getRangoSwap(options, meta, false);
    if (!res) return null;

    let totalGaslimit: number;
    switch (res.networkTransactions.type) {
      case NetworkType.EVM: {
        totalGaslimit = res.networkTransactions.transactions.reduce(
          (total: number, curVal: EVMTransaction) =>
            total + toBN(curVal.gasLimit).toNumber(),
          0
        );
        break;
      }
      case NetworkType.Solana: {
        for (
          let i = 0, len = res.networkTransactions.transactions.length;
          i < len;
          i++
        ) {
          const tx = res.networkTransactions.transactions[i];
          totalGaslimit += extractComputeBudget(
            VersionedTransaction.deserialize(
              Buffer.from(tx.serialized, "base64")
            )
          );
        }
        break;
      }
      default: {
        res.networkTransactions satisfies never;
        totalGaslimit = 0;
        break;
      }
    }

    const response: ProviderQuoteResponse = {
      fromTokenAmount: res.fromTokenAmount,
      toTokenAmount: res.toTokenAmount,
      additionalNativeFees: res.additionalNativeFees,
      provider: this.name,
      quote: {
        meta,
        options,
        provider: this.name,
      },
      totalGaslimit,
      minMax: await this.getMinMaxAmount(),
    };

    return response;
  }

  async getSwap(quote: SwapQuote): Promise<ProviderSwapResponse | null> {
    const res = await this.getRangoSwap(quote.options, quote.meta, true);
    if (!res) return null;
    const feeConfig =
      FEE_CONFIGS[this.name][quote.meta.walletIdentifier].fee || 0;
    const response: ProviderSwapResponse = {
      fromTokenAmount: res.fromTokenAmount,
      provider: this.name,
      toTokenAmount: res.toTokenAmount,
      additionalNativeFees: res.additionalNativeFees,
      transactions: res.networkTransactions.transactions,
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
  }

  async getStatus(options: StatusOptions): Promise<TransactionStatus> {
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
      const res = await rangoClient.status({
        txId: transactionHash,
        requestId,
      });

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
    }

    const statuses: TransactionStatus[] = [];
    switch (this.network) {
      case SupportedNetworkName.Solana: {
        // Get status of Solana transactions
        const sigStatuses = await (
          this.web3 as Connection
        ).getSignatureStatuses(transactionHashes);
        for (let i = 0, len = sigStatuses.value.length; i < len; i++) {
          const sigStatus = sigStatuses.value[i];
          if (sigStatus == null) {
            statuses.push(TransactionStatus.pending);
          } else if (sigStatus.err != null) {
            statuses.push(TransactionStatus.failed);
          } else {
            statuses.push(TransactionStatus.success);
          }
        }
        break;
      }
      // Assume EVM
      default: {
        // Get status of EVM transactions
        const receipts = await Promise.all(
          transactionHashes.map((hash) =>
            (this.web3 as Web3Eth).getTransactionReceipt(hash)
          )
        );

        for (let i = 0, len = receipts.length; i < len; i++) {
          const receipt = receipts[i];
          let status: TransactionStatus;
          if (!receipt || (receipt && !receipt.blockNumber)) {
            status = TransactionStatus.pending;
          } else if (receipt && !receipt.status) {
            status = TransactionStatus.failed;
          } else {
            status = TransactionStatus.success;
          }
          statuses.push(status);
        }
        break;
      }
    }

    // If any failed or are still pending, return their status
    for (let i = 0, len = statuses.length; i < len; i++) {
      const status = statuses[i];
      switch (status) {
        case TransactionStatus.failed:
          return status;
        case TransactionStatus.pending:
          return status;
        case TransactionStatus.success: /* noop */
        default: /* noop */
      }
    }

    // no failed or pending, assume success
    return TransactionStatus.success;
  }
}

export default Rango;
