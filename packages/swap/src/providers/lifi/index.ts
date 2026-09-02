import type Web3Eth from "web3-eth";
import { numberToHex, toBN } from "web3-utils";
import { DebugLogger } from "@enkryptcom/utils";
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
  SolanaTransaction,
  SwapTransaction,
  SwapType,
  TokenType,
  TransactionStatus,
  TransactionType,
} from "../../types";
import {
  DEFAULT_SLIPPAGE,
  FEE_CONFIGS,
  GAS_LIMITS,
  NATIVE_TOKEN_ADDRESS,
  NATIVE_TOKEN_ADDRESS_SOLANA,
  LIFI_INTEGRATOR_ID,
  TOKEN_LISTS,
} from "../../configs";
import {
  getAllowanceTransactions,
  TOKEN_AMOUNT_INFINITY_AND_BEYOND,
} from "../../utils/approvals";
import estimateEVMGasList from "../../common/estimateGasList";
import {
  LiFiQuoteErrorResponse,
  LiFiQuoteResponse,
  LiFiStatusResponse,
} from "./types";
import { VersionedTransaction } from "@solana/web3.js";
import supportedNetworks from "./supported";

const logger = new DebugLogger("swap:lifi");
const BASE_URL = "https://li.quest/v1";

class LiFi extends ProviderClass {
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
    this.name = ProviderName.lifi;
    this.fromTokens = {};
    this.toTokens = {};
  }

  async init(tokenList: TokenType[]): Promise<void> {
    logger.info("init: Initialising...");

    if (!LiFi.isSupported(this.network)) {
      logger.info(
        `init: Enkrypt does not support Li.Fi on this network  network=${this.network}`,
      );
      return;
    }

    // Fill from token list
    tokenList.forEach((token) => {
      this.fromTokens[token.address] = token;
    });

    for (const networkName of Object.keys(supportedNetworks)) {
      if (!this.toTokens[networkName]) this.toTokens[networkName] = {};

      try {
        //
        const tokenResponse = await fetch(TOKEN_LISTS[networkName]);
        const tokenResult = await tokenResponse.json();

        // map token list to each destination network
        tokenResult.all.forEach((token) => {
          const tokenAddress = this.normalizeEvmAddress(token.address);

          this.toTokens[networkName][tokenAddress] = {
            ...token,
            address: tokenAddress,
            networkInfo: {
              name: networkName,
              isAddress: supportedNetworks[networkName].isAddress,
            },
          };
        });
      } catch (error) {
        console.warn("Error Initialising li.fi tokens list: ", String(error));
      }
    }
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
      minimumFrom: toBN("0"),
      maximumFrom: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
      minimumTo: toBN("0"),
      maximumTo: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
    });
  }

  private normalizeEvmAddress(address: string) {
    if (address?.startsWith("0x") && address.length === 42) {
      return address.toLowerCase();
    }
    // pass non evm addresses without changing case
    return address;
  }

  private withTimeoutSignal(
    signal: AbortSignal | undefined,
    timeoutMs: number,
  ): {
    signal: AbortSignal;
    cleanup: () => void;
  } {
    const aborter = new AbortController();
    const onAbort = () => aborter.abort(signal?.reason);
    const onTimeout = () =>
      aborter.abort(new Error(`Li.Fi API request timed out (${timeoutMs}ms)`));
    const timeout = setTimeout(onTimeout, timeoutMs);
    signal?.addEventListener("abort", onAbort);
    return {
      signal: aborter.signal,
      cleanup: () => {
        clearTimeout(timeout);
        signal?.removeEventListener("abort", onAbort);
      },
    };
  }

  private async getLiFiQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal },
  ): Promise<LiFiQuoteResponse | null> {
    let fromTokenAddress = options.fromToken.address;
    let toTokenAddress = options.toToken.address;

    if (options.fromToken.name === supportedNetworks.SOLANA.lifiName) {
      fromTokenAddress = NATIVE_TOKEN_ADDRESS_SOLANA;
    }
    if (options.toToken.name === supportedNetworks.SOLANA.lifiName) {
      toTokenAddress = NATIVE_TOKEN_ADDRESS_SOLANA;
    }

    const params = new URLSearchParams({
      fromChain: String(supportedNetworks[this.network].chainId),
      toChain: String(
        supportedNetworks[options.toToken.networkInfo.name].chainId,
      ),
      fromToken: this.normalizeEvmAddress(fromTokenAddress),
      toToken: this.normalizeEvmAddress(toTokenAddress),
      fromAmount: options.amount.toString(),
      fromAddress: this.normalizeEvmAddress(options.fromAddress),
      toAddress: this.normalizeEvmAddress(options.toAddress),
      slippage: (parseFloat(DEFAULT_SLIPPAGE) / 100).toString(),
      integrator: LIFI_INTEGRATOR_ID,
      fee: String(
        FEE_CONFIGS[this.name]?.[meta.walletIdentifier]?.fee ?? 0.002,
      ),
      referrer: FEE_CONFIGS[this.name]?.[meta.walletIdentifier]?.referrer ?? "",
    });
    const withTimeout = this.withTimeoutSignal(context?.signal, 30_000);
    try {
      const response = await fetch(`${BASE_URL}/quote?${params.toString()}`, {
        signal: withTimeout.signal,
      });
      const json = (await response.json()) as
        | LiFiQuoteResponse
        | LiFiQuoteErrorResponse;
      if (!response.ok) {
        console.warn("Li.Fi quote error", json);
        return null;
      }
      if (!(json as LiFiQuoteResponse).transactionRequest) {
        return null;
      }
      return json as LiFiQuoteResponse;
    } finally {
      withTimeout.cleanup();
    }
  }

  private getHexValue(value?: string) {
    if (!value || value === "0") return "0x0";
    if (value.startsWith("0x")) return value;
    return numberToHex(value);
  }

  private async getLiFiSwap(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    accurateEstimate: boolean,
    context?: { signal?: AbortSignal },
  ): Promise<{
    transactions: SwapTransaction[];
    toTokenAmount: ReturnType<typeof toBN>;
    fromTokenAmount: ReturnType<typeof toBN>;
    tool: string;
    fromChain: string;
    toChain: string;
  } | null> {
    if (
      !LiFi.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName,
      ) ||
      !LiFi.isSupported(this.network)
    ) {
      return null;
    }
    const normalizedFromAddress = this.normalizeEvmAddress(options.fromAddress);
    const normalizedFromTokenAddress = this.normalizeEvmAddress(
      options.fromToken.address,
    );

    const quote = await this.getLiFiQuote(options, meta, context);
    if (!quote?.transactionRequest?.to && !quote?.transactionRequest?.data) {
      return null;
    }

    const transactions: SwapTransaction[] = [];
    const isSolanaTx = !quote.transactionRequest.to;

    if (isSolanaTx) {
      // Solana Tx
      const bytes = Uint8Array.from(
        Buffer.from(quote.transactionRequest.data, "base64"),
      );
      const versionedTx = VersionedTransaction.deserialize(bytes);

      const solTx: SolanaTransaction = {
        from: this.normalizeEvmAddress(options.fromAddress),
        to: this.normalizeEvmAddress(options.toAddress),
        kind: versionedTx.version === "legacy" ? "legacy" : "versioned",
        serialized: quote.transactionRequest.data,
        type: TransactionType.solana,
        thirdPartySignatures: [],
      };
      transactions.push(solTx);
    } else {
      // EVM case
      if (
        options.fromToken.address !== NATIVE_TOKEN_ADDRESS &&
        quote.estimate?.approvalAddress
      ) {
        const normalizedFromToken: TokenType = {
          ...options.fromToken,
          address: normalizedFromTokenAddress,
        };
        const approvalTxs = await getAllowanceTransactions({
          infinityApproval: meta.infiniteApproval,
          spender: this.normalizeEvmAddress(quote.estimate.approvalAddress),
          web3eth: this.web3eth,
          amount: options.amount,
          fromAddress: normalizedFromAddress,
          fromToken: normalizedFromToken,
        });
        transactions.push(...approvalTxs);
      }

      transactions.push({
        from: normalizedFromAddress,
        gasLimit: quote.transactionRequest.gasLimit
          ? this.getHexValue(quote.transactionRequest.gasLimit)
          : GAS_LIMITS.swap,
        to: this.normalizeEvmAddress(quote.transactionRequest.to),
        value: this.getHexValue(quote.transactionRequest.value),
        data: quote.transactionRequest.data,
        type: TransactionType.evm,
      });
    }

    if (accurateEstimate && !isSolanaTx) {
      const accurateGasEstimate = await estimateEVMGasList(
        transactions as EVMTransaction[],
        this.network,
      );
      if (accurateGasEstimate) {
        if (accurateGasEstimate.isError) return null;
        (transactions as EVMTransaction[]).forEach((tx, idx) => {
          tx.gasLimit = accurateGasEstimate.result[idx];
        });
      }
    }

    return {
      transactions,
      toTokenAmount: toBN(quote.estimate?.toAmount),
      fromTokenAmount: toBN(quote.estimate?.fromAmount),
      tool: quote.tool,
      fromChain: String(quote.action?.fromChainId ?? ""),
      toChain: String(quote.action?.toChainId ?? ""),
    };
  }

  getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderQuoteResponse | null> {
    return this.getLiFiSwap(options, meta, false, context)
      .then(async (res) => {
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
            (total: number, curVal: SwapTransaction) =>
              curVal.type === TransactionType.evm
                ? total + toBN(curVal.gasLimit).toNumber()
                : total,
            0,
          ),
          minMax: await this.getMinMaxAmount(),
        };
        return response;
      })
      .catch((e) => {
        if ((e as Error)?.name === "AbortError") return null;
        console.error(e);
        return null;
      });
  }

  getSwap(
    quote: SwapQuote,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderSwapResponse | null> {
    return this.getLiFiSwap(quote.options, quote.meta, true, context)
      .then((res) => {
        if (!res) return null;
        const feeConfig =
          FEE_CONFIGS[this.name]?.[quote.meta.walletIdentifier]?.fee || 0;
        const response: ProviderSwapResponse = {
          fromTokenAmount: res.fromTokenAmount,
          provider: this.name,
          type: SwapType.regular,
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
              bridge: res.tool,
              fromChain: res.fromChain,
              toChain: res.toChain,
            },
            provider: this.name,
          }),
        };
        return response;
      })
      .catch((e) => {
        if ((e as Error)?.name === "AbortError") return null;
        console.error(e);
        return null;
      });
  }

  async getStatus(options: StatusOptions): Promise<TransactionStatus> {
    const txHash = options.transactions?.[1]?.hash;
    if (!txHash) return TransactionStatus.pending;

    const params = new URLSearchParams({
      txHash,
    });
    if (options.bridge) params.set("bridge", String(options.bridge));
    if (options.fromChain) params.set("fromChain", String(options.fromChain));
    if (options.toChain) params.set("toChain", String(options.toChain));

    const response = await fetch(`${BASE_URL}/status?${params.toString()}`);
    if (!response.ok) return TransactionStatus.pending;
    const json = (await response.json()) as LiFiStatusResponse;

    if (json.status === "FAILED") return TransactionStatus.failed;
    if (json.status === "DONE") {
      if (json.substatus === "REFUNDED") return TransactionStatus.failed;
      return TransactionStatus.success;
    }
    return TransactionStatus.pending;
  }
}

export default LiFi;
