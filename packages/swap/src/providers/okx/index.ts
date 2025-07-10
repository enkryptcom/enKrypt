import { NetworkNames } from "@enkryptcom/types";
import { Connection, PublicKey } from "@solana/web3.js";
import { toBN } from "web3-utils";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "../../utils/approvals";
import {
  getSPLAssociatedTokenAccountPubkey,
  getTokenProgramOfMint,
  isValidSolanaAddressAsync,
  solAccountExists,
  SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
  WRAPPED_SOL_ADDRESS,
} from "../../utils/solana";
import {
  ProviderClass,
  ProviderName,
  TokenType,
  SupportedNetworkName,
  ProviderFromTokenResponse,
  ProviderToTokenResponse,
  ProviderSwapResponse,
  SwapQuote,
  StatusOptions,
  TransactionStatus,
  getQuoteOptions,
  ProviderQuoteResponse,
  QuoteMetaOptions,
  TransactionType,
  StatusOptionsResponse,
  SolanaTransaction,
  TokenNetworkType,
  WalletIdentifier,
} from "../../types";
import {
  DEFAULT_SLIPPAGE,
  FEE_CONFIGS,
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";
import { DebugLogger } from "@enkryptcom/utils";
import { OKXQuoteResponse, OKXSwapResponse, OKXTokenInfo } from "./types";

const logger = new DebugLogger("swap:okx");

const SOL_NATIVE_ADDRESS = "11111111111111111111111111111111";
const OKX_API_URL = "https://partners.mewapi.io/okxswapv5";
const OKX_TOKENS_URL = "/all-tokens";
const OKX_QUOTE_URL = "/quote";
const OKX_SWAP_URL = "/swap";

// Rate limiting: minimum 2000ms between requests
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // ms
let requestCount = 0;

// Helper to enforce rate limiting
async function rateLimitedRequest(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    logger.info(`Rate limiting: waiting ${delay}ms before next request`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
  requestCount++;
  logger.info(
    `OKX API request #${requestCount} at ${new Date().toISOString()}`,
  );
}

// Helper to retry requests with exponential backoff
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await rateLimitedRequest();
      logger.info(`OKX API attempt ${attempt + 1}/${maxRetries + 1}`);
      return await requestFn();
    } catch (error: any) {
      lastError = error;

      // If it's a 429 error and we haven't exhausted retries, wait and retry
      if (
        error.message?.includes("429") ||
        error.message?.includes("Too Many Requests")
      ) {
        let delay = baseDelay * Math.pow(2, attempt); // exponential backoff
        // Check for Retry-After header if available
        if (error.response && error.response.headers) {
          const retryAfter =
            error.response.headers.get &&
            error.response.headers.get("Retry-After");
          if (retryAfter) {
            const retryAfterMs = parseInt(retryAfter, 10) * 1000;
            if (!isNaN(retryAfterMs)) {
              delay = Math.max(delay, retryAfterMs);
              logger.info(
                `OKX API Retry-After header present, waiting ${delay}ms`,
              );
            }
          }
        }
        if (attempt < maxRetries) {
          logger.info(
            `OKX API rate limited (429), retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // For other errors or if we've exhausted retries, throw the error
      logger.error(
        `OKX API request failed after ${attempt + 1} attempts: ${error.message}`,
      );
      throw error;
    }
  }

  throw lastError!;
}

/**
 * OKX DEX Aggregator Provider
 *
 * Implements swap functionality using OKX's DEX aggregator API
 * @see https://web3.okx.com/docs-v5/en/#rest-api-trading-get-token-list
 */
export class OKX extends ProviderClass {
  network: SupportedNetworkName;
  name = ProviderName.okx;
  conn: Connection;

  /** Initialised in `init` */
  fromTokens: ProviderFromTokenResponse;

  /** initialised in `init` */
  toTokens: ProviderToTokenResponse;

  /** Initialised in `init` address -> OKX token info */
  okxTokens: Map<string, OKXTokenInfo>;

  constructor(conn: Connection, network: SupportedNetworkName) {
    super();
    this.network = network;
    this.conn = conn;

    this.fromTokens = {};
    this.toTokens = {};
    this.okxTokens = new Map();
  }

  /**
   * Initialize the provider with token list
   */
  async init(enkryptTokenList: TokenType[]): Promise<void> {
    // Only supports Solana
    if ((this.network as unknown as string) !== NetworkNames.Solana) return;

    // Get OKX token list
    const okxTokenList = await this.getOKXTokens();

    // Initialize token mappings
    this.toTokens[this.network] ??= {};
    this.okxTokens = new Map(
      okxTokenList.map((t) => [t.tokenContractAddress, t]),
    );

    for (const enkryptToken of enkryptTokenList) {
      let isTradeable = false;
      if (enkryptToken.address === NATIVE_TOKEN_ADDRESS) {
        // OKX swap API auto unwraps SOL
        isTradeable = this.okxTokens.has(WRAPPED_SOL_ADDRESS);
      } else {
        isTradeable = this.okxTokens.has(enkryptToken.address);
      }

      // Not supported
      if (!isTradeable) continue;

      // Add token to fromTokens
      this.fromTokens[enkryptToken.address] = enkryptToken;

      // Add token to toTokens with network info
      this.toTokens[this.network][enkryptToken.address] = {
        ...enkryptToken,
        networkInfo: {
          name: SupportedNetworkName.Solana,
          isAddress: isValidSolanaAddressAsync,
        } satisfies TokenNetworkType,
      };
    }
  }

  getFromTokens(): ProviderFromTokenResponse {
    return this.fromTokens;
  }

  getToTokens(): ProviderToTokenResponse {
    return this.toTokens;
  }

  /**
   * Get a quote for swapping tokens
   */
  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderQuoteResponse | null> {
    try {
      if (!meta || !meta.walletIdentifier) {
        console.warn(
          "[OKX.getQuote] meta or meta.walletIdentifier is missing, using WalletIdentifier.enkrypt as fallback:",
          meta,
        );
        meta = { ...meta, walletIdentifier: WalletIdentifier.enkrypt };
      }
      if (options.toToken.networkInfo.name !== SupportedNetworkName.Solana) {
        logger.info(
          `getQuote: ignoring quote request to network ${options.toToken.networkInfo.name},` +
            ` cross network swaps not supported`,
        );
        return null;
      }

      const feeConf = FEE_CONFIGS[this.name][meta.walletIdentifier];
      if (!feeConf) {
        throw new Error("Something went wrong: no fee config for OKX swap");
      }

      const toPubkey = new PublicKey(options.toAddress);

      // Source token
      let srcMint: PublicKey;
      if (options.fromToken.address === NATIVE_TOKEN_ADDRESS) {
        srcMint = new PublicKey(WRAPPED_SOL_ADDRESS);
      } else {
        srcMint = new PublicKey(options.fromToken.address);
      }

      // Destination token
      let dstMint: PublicKey;
      if (options.toToken.address === NATIVE_TOKEN_ADDRESS) {
        dstMint = new PublicKey(WRAPPED_SOL_ADDRESS);
      } else {
        dstMint = new PublicKey(options.toToken.address);
      }

      // Get quote from OKX API
      const quote = await this.getOKXQuote(
        {
          srcMint,
          dstMint,
          amount: BigInt(options.amount.toString(10)),
          slippageBps: Math.round(
            100 * parseFloat(meta.slippage || DEFAULT_SLIPPAGE),
          ),
          referralFeeBps: Math.round(10000 * feeConf.fee),
        },
        context,
      );

      // Calculate compute budget and rent fees
      const dstTokenProgramId = await getTokenProgramOfMint(this.conn, dstMint);
      const dstATAPubkey = getSPLAssociatedTokenAccountPubkey(
        toPubkey,
        dstMint,
        dstTokenProgramId,
      );

      let rentFees = 0;
      try {
        const dstATAExists = await solAccountExists(this.conn, dstATAPubkey);
        if (!dstATAExists) {
          const extraRentFee =
            await this.conn.getMinimumBalanceForRentExemption(
              SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
            );
          rentFees += extraRentFee;
        }
      } catch (error) {
        // If we can't check if the account exists (RPC timeout), assume it doesn't exist
        // and add rent fees as a safety measure
        logger.warn(
          `Could not check if destination token account exists: ${error}`,
        );
        try {
          const extraRentFee =
            await this.conn.getMinimumBalanceForRentExemption(
              SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
            );
          rentFees += extraRentFee;
        } catch (rentError) {
          logger.warn(`Could not get rent exemption: ${rentError}`);
          // Use a default rent fee if we can't get it
          rentFees += 2039280; // Default SOL rent exemption for token account
        }
      }

      logger.info(
        `getQuote: Quote inAmount: ${quote.fromTokenAmount} ${options.fromToken.symbol}`,
      );
      logger.info(
        `getQuote: Quote outAmount: ${quote.toTokenAmount} ${options.toToken.symbol}`,
      );

      return {
        fromTokenAmount: toBN(quote.fromTokenAmount),
        toTokenAmount: toBN(
          Math.floor((1 - feeConf.fee) * Number(quote.toTokenAmount))
            .toFixed(10)
            .replace(/\.?0+$/, ""),
        ),
        totalGaslimit: 0, // Will be set in getSwap
        additionalNativeFees: toBN(rentFees),
        provider: this.name,
        quote: {
          options,
          meta,
          provider: this.name,
        },
        minMax: {
          minimumFrom: toBN("1"),
          maximumFrom: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
          minimumTo: toBN("1"),
          maximumTo: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
        },
      };
    } catch (err) {
      if (!context?.signal?.aborted) {
        console.error(`[OKX.getQuote] Error calling getQuote: ${String(err)}`);
      }
      return null;
    }
  }

  async getSwap(
    quote: SwapQuote,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderSwapResponse | null> {
    try {
      const { feePercentage, okxQuote, base64SwapTransaction, rentFees } =
        await this.querySwapInfo(quote.options, quote.meta, context);

      const enkryptTransaction: SolanaTransaction = {
        from: quote.options.fromAddress,
        to: quote.options.toAddress,
        serialized: base64SwapTransaction,
        type: TransactionType.solana,
        kind: "versioned",
        thirdPartySignatures: [],
      };

      logger.info(`OKX getSwap: Final transaction data check:`);
      logger.info(`  - serialized length: ${base64SwapTransaction.length}`);
      logger.info(
        `  - first 100 chars: ${base64SwapTransaction.substring(0, 100)}`,
      );
      logger.info(
        `  - last 100 chars: ${base64SwapTransaction.substring(base64SwapTransaction.length - 100)}`,
      );

      // Verify it's still valid base64
      try {
        const testDecode = Buffer.from(base64SwapTransaction, "base64");
        logger.info(`  - decoded length: ${testDecode.length} bytes`);
      } catch (testError) {
        logger.error(`  - base64 decode test failed: ${testError}`);
      }

      logger.info(
        `getSwap: Quote inAmount:  ${okxQuote.fromTokenAmount} ${quote.options.fromToken.symbol}`,
      );
      logger.info(
        `getSwap: Quote outAmount: ${okxQuote.toTokenAmount} ${quote.options.toToken.symbol}`,
      );

      return {
        transactions: [enkryptTransaction],
        fromTokenAmount: toBN(okxQuote.fromTokenAmount),
        toTokenAmount: toBN(
          Math.floor((1 - feePercentage / 100) * Number(okxQuote.toTokenAmount))
            .toFixed(10)
            .replace(/\.?0+$/, ""),
        ),
        additionalNativeFees: toBN(rentFees),
        provider: this.name,
        slippage: quote.meta.slippage,
        fee: feePercentage,
        getStatusObject: async (
          options: StatusOptions,
        ): Promise<StatusOptionsResponse> => ({
          options,
          provider: this.name,
        }),
      };
    } catch (err) {
      if (!context?.signal?.aborted) {
        console.error(`[OKX.getSwap] Error calling getSwap: ${String(err)}`);
      }
      return null;
    }
  }

  /**
   * Get transaction status
   */
  async getStatus(options: StatusOptions): Promise<TransactionStatus> {
    if (options.transactions.length !== 1) {
      throw new TypeError(
        `OKX.getStatus: Expected one transaction hash but got ${options.transactions.length}`,
      );
    }

    const [{ sentAt, hash }] = options.transactions;
    const txResponse = await this.conn.getTransaction(hash, {
      maxSupportedTransactionVersion: 0,
    });

    if (txResponse == null) {
      // Consider dropped (/failed) if it's still null after 3 minutes
      if (Date.now() > sentAt + 3 * 60_000) {
        return TransactionStatus.dropped;
      }

      // Transaction hasn't been picked up by the node yet
      return TransactionStatus.pending;
    }

    if (txResponse.meta == null) {
      return TransactionStatus.pending;
    }

    if (txResponse.meta.err != null) {
      return TransactionStatus.failed;
    }

    return TransactionStatus.success;
  }

  /**
   * Get list of tokens from OKX API
   */
  private async getOKXTokens(): Promise<OKXTokenInfo[]> {
    return retryRequest(async () => {
      const params = {
        chainId: "501", // Solana Chain ID
      };

      const requestPath = OKX_TOKENS_URL;
      const queryString = "?" + new URLSearchParams(params).toString();

      const response = await fetch(
        `${OKX_API_URL}${requestPath}${queryString}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get OKX tokens: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.data;
    });
  }

  /**
   * Get quote from OKX API
   */
  private async getOKXQuote(
    params: {
      srcMint: PublicKey;
      dstMint: PublicKey;
      amount: bigint;
      slippageBps: number;
      referralFeeBps: number;
    },
    context?: { signal?: AbortSignal },
  ): Promise<OKXQuoteResponse> {
    return retryRequest(async () => {
      const { srcMint, dstMint, amount, slippageBps, referralFeeBps } = params;

      // QUOTE endpoint requires chainIndex and chainId, but NOT userWalletAddress or slippage
      const quoteParams: Record<string, string> = {
        // chainIndex: "501", // Solana Chain Index
        chainId: "501", // Solana Chain ID
        fromTokenAddress: srcMint.toBase58(),
        toTokenAddress: dstMint.toBase58(),
        amount: amount.toString(10),
        swapMode: "exactIn",
      };

      // Only add feePercent if there's actually a fee (must be > 0 and <= 10)
      // referralFeeBps is already in basis points, convert to percentage
      const feePercent = Math.round(referralFeeBps / 100);
      if (feePercent > 0 && feePercent <= 10) {
        quoteParams.feePercent = feePercent.toString();
      }

      logger.info(`OKX: Quote parameters:`, quoteParams);

      const requestPath = OKX_QUOTE_URL;
      const queryString = "?" + new URLSearchParams(quoteParams).toString();

      const fullUrl = `${OKX_API_URL}${requestPath}${queryString}`;
      logger.info(`OKX: Making quote API call to: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: "GET",
        signal: context?.signal,
      });

      logger.info(
        `OKX: Quote response status: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`OKX: Quote API error response:`, errorText);
        throw new Error(
          `Failed to get OKX quote: ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 500)}`,
        );
      }

      const data = await response.json();
      logger.info(`OKX: Quote API response:`, JSON.stringify(data, null, 2));

      // Validate quote response
      if (!data) {
        throw new Error(`OKX quote API returned null/undefined response`);
      }

      if (data.code !== undefined && data.code !== "0") {
        logger.error(
          `OKX: Quote API returned error code:`,
          data.code,
          data.msg || data.message,
        );
        throw new Error(
          `OKX quote API error: ${data.code} - ${data.msg || data.message || "Unknown error"}`,
        );
      }

      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        logger.error(`OKX: No quote data available:`, data);
        throw new Error(
          `No quote available from OKX for tokens ${srcMint.toBase58()} -> ${dstMint.toBase58()}, amount: ${amount.toString()}`,
        );
      }

      const quote = data.data[0];
      if (!quote || !quote.fromTokenAmount || !quote.toTokenAmount) {
        logger.error(`OKX: Invalid quote structure:`, quote);
        throw new Error(`Invalid quote data from OKX API`);
      }

      logger.info(
        `OKX: Successfully received quote: ${quote.fromTokenAmount} -> ${quote.toTokenAmount}`,
      );
      return quote;
    });
  }

  /**
   * Get swap transaction from OKX API
   */
  private async getOKXSwap(
    params: any,
    context?: { signal?: AbortSignal },
  ): Promise<OKXSwapResponse> {
    return retryRequest(async () => {
      const requestPath = OKX_SWAP_URL;
      const queryString = "?" + new URLSearchParams(params).toString();

      const fullUrl = `${OKX_API_URL}${requestPath}${queryString}`;
      logger.info(`OKX: Making swap API call to: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: "GET",
        signal: context?.signal,
      });

      logger.info(
        `OKX: Response status: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`OKX: API error response:`, errorText);
        throw new Error(
          `Failed to get OKX swap: ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 500)}`,
        );
      }

      const data = await response.json();

      // Log the response structure for debugging
      logger.info(`OKX: Swap API response structure:`, {
        hasData: !!data,
        hasDataArray: !!(data && data.data),
        dataLength: data && data.data ? data.data.length : 0,
        code: data?.code,
        message: data?.msg || data?.message,
      });

      // Validate response structure
      if (!data) {
        throw new Error(`OKX API returned null/undefined response`);
      }

      if (data.code !== undefined && data.code !== "0") {
        logger.error(
          `OKX: API returned error code:`,
          data.code,
          data.msg || data.message,
        );
        throw new Error(
          `OKX API error: ${data.code} - ${data.msg || data.message || "Unknown error"}`,
        );
      }

      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        logger.error(`OKX: Invalid response structure:`, data);
        throw new Error(`Invalid OKX API response structure`);
      }

      const swapData = data.data[0];
      if (!swapData || !swapData.tx || !swapData.tx.data) {
        logger.error(`OKX: Missing transaction data:`, swapData);
        throw new Error(`Missing transaction data in OKX response`);
      }

      // CRITICAL: Log the exact transaction data we receive
      const rawTxData = swapData.tx.data;

      // Validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      const isValidBase64 = base64Regex.test(rawTxData);
      logger.info(`Base64 format validation: ${isValidBase64}`);

      if (!isValidBase64) {
        throw new Error(`Invalid base64 format in transaction data`);
      }

      // Test decode
      try {
        const testDecode = Buffer.from(rawTxData, "base64");
        logger.info(`✅ Successfully decoded to ${testDecode.length} bytes`);
        logger.info(
          `Decoded data (first 20 bytes): ${Array.from(testDecode.slice(0, 20))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ")}`,
        );
      } catch (e) {
        logger.error(`❌ Failed to decode as base64: ${e.message}`);
        throw new Error(
          `Cannot decode transaction data as base64: ${e.message}`,
        );
      }

      logger.info(`OKX: Successfully received swap transaction data`);
      return swapData;
    });
  }

  /**
   * Query swap info from OKX API - Fixed version
   */
  private async querySwapInfo(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal },
  ): Promise<{
    okxQuote: OKXQuoteResponse;
    base64SwapTransaction: string;
    feePercentage: number;
    rentFees: number;
  }> {
    if (!meta || !meta.walletIdentifier) {
      logger.warn(
        "[OKX.querySwapInfo] meta or meta.walletIdentifier is missing, using WalletIdentifier.enkrypt as fallback:",
        meta,
      );
      meta = { ...meta, walletIdentifier: WalletIdentifier.enkrypt };
    }

    const feeConf = FEE_CONFIGS[this.name][meta.walletIdentifier];
    if (!feeConf) {
      throw new Error("Something went wrong: no fee config for OKX swap");
    }

    const toPubkey = new PublicKey(options.toAddress);

    // Get quote first (using wrapped SOL addresses for quote API)
    const srcMint = new PublicKey(
      options.fromToken.address === NATIVE_TOKEN_ADDRESS
        ? WRAPPED_SOL_ADDRESS
        : options.fromToken.address,
    );
    const dstMint = new PublicKey(
      options.toToken.address === NATIVE_TOKEN_ADDRESS
        ? WRAPPED_SOL_ADDRESS
        : options.toToken.address,
    );

    // DEBUG: Log the exact parameters being passed to getOKXQuote
    const quoteParams = {
      srcMint: srcMint.toBase58(),
      dstMint: dstMint.toBase58(),
      amount: BigInt(options.amount.toString(10)),
      slippageBps: Math.round(
        100 * parseFloat(meta.slippage || DEFAULT_SLIPPAGE),
      ),
      referralFeeBps: Math.round(10000 * feeConf.fee),
    };
    logger.info(
      `[DEBUG] querySwapInfo calling getOKXQuote with params:`,
      quoteParams,
    );

    const quote = await this.getOKXQuote(
      {
        srcMint,
        dstMint,
        amount: BigInt(options.amount.toString(10)),
        slippageBps: Math.round(
          100 * parseFloat(meta.slippage || DEFAULT_SLIPPAGE),
        ),
        referralFeeBps: Math.round(10000 * feeConf.fee),
      },
      context,
    );

    // SWAP endpoint requires userWalletAddress and slippage, but NOT chainIndex/chainId
    const swapSrcTokenAddress =
      options.fromToken.address === NATIVE_TOKEN_ADDRESS
        ? WRAPPED_SOL_ADDRESS
        : options.fromToken.address;
    const swapDstTokenAddress =
      options.toToken.address === NATIVE_TOKEN_ADDRESS
        ? WRAPPED_SOL_ADDRESS
        : options.toToken.address;
    const swapParams: Record<string, string> = {
      chainId: "501", // Solana Chain ID - required for swap API
      amount: options.amount.toString(10),
      fromTokenAddress: swapSrcTokenAddress,
      toTokenAddress: swapDstTokenAddress,
      userWalletAddress: options.fromAddress,
      slippage: parseFloat(meta.slippage || DEFAULT_SLIPPAGE).toString(),
      swapMode: "exactIn",
    };
    const feePercent = Math.round(feeConf.fee * 100);
    if (feePercent > 0 && feePercent <= 10 && feeConf.referrer) {
      swapParams.feePercent = feePercent.toString();
      swapParams.toTokenReferrerAddress = feeConf.referrer;
      logger.info(
        `OKX: Adding fee parameters - feePercent: ${feePercent}%, referrer: ${feeConf.referrer}`,
      );
    }
    logger.info(
      "OKX: Final swapParams for swap call:",
      JSON.stringify(swapParams, null, 2),
    );
    const swap = await this.getOKXSwap(swapParams, context);
    if (!swap || !swap.tx || !swap.tx.data) {
      throw new Error(`Invalid swap response from OKX API`);
    }
    const txData = swap.tx.data;
    // Calculate rent fees for destination token account
    let rentFees = 0;
    try {
      const dstTokenProgramId = await getTokenProgramOfMint(this.conn, dstMint);
      const dstATAPubkey = getSPLAssociatedTokenAccountPubkey(
        toPubkey,
        dstMint,
        dstTokenProgramId,
      );
      const dstATAExists = await solAccountExists(this.conn, dstATAPubkey);
      if (!dstATAExists) {
        const extraRentFee = await this.conn.getMinimumBalanceForRentExemption(
          SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
        );
        rentFees += extraRentFee;
      }
    } catch (error) {
      logger.warn(`Could not check destination token account: ${error}`);
      rentFees += 2039280; // Default SOL rent exemption
    }
    return {
      okxQuote: swap.routerResult,
      base64SwapTransaction: txData,
      feePercentage: feeConf.fee * 100,
      rentFees,
    };
  }
}
