import { NetworkNames } from "@enkryptcom/types";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
  SystemProgram,
} from "@solana/web3.js";
import bs58 from "bs58";
import { toBN } from "web3-utils";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "../../utils/approvals";
import {
  getSPLAssociatedTokenAccountPubkey,
  getTokenProgramOfMint,
  isValidSolanaAddressAsync,
  solAccountExists,
  SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
  WRAPPED_SOL_ADDRESS,
  getCreateAssociatedTokenAccountIdempotentInstruction,
  insertInstructionsAtStartOfTransaction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
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
const OKX_API_URL = "http://localhost:3001";
const OKX_TOKENS_URL = "/api/v5/dex/aggregator/all-tokens";
const OKX_QUOTE_URL = "/api/v5/dex/aggregator/quote";
const OKX_SWAP_URL = "/api/v5/dex/aggregator/swap";

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

      // Get quote from OKX API first to get estimated gas fee
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

      // Check if user has sufficient balance for SOL swaps
      if (options.fromToken.address === NATIVE_TOKEN_ADDRESS) {
        const fromPubkey = new PublicKey(options.fromAddress);
        const userBalance = await this.conn.getBalance(fromPubkey);
        const swapAmount = BigInt(options.amount.toString(10));
        // Use actual estimated gas fee from OKX response instead of hardcoded buffer
        const estimatedGasFee = BigInt(quote.estimateGasFee);
        const bufferAmount = estimatedGasFee + BigInt(1000000); // Add small buffer (0.001 SOL) on top of estimated fee
        const totalNeeded = swapAmount + bufferAmount;

        if (BigInt(userBalance) < totalNeeded) {
          logger.warn(
            `Insufficient SOL balance for quote. Need ${Number(totalNeeded) / 1e9} SOL but have ${userBalance / 1e9} SOL`,
          );
          return null; // Return null instead of throwing to allow other providers
        }
      }

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

      // Use Jupiter's approach: inject ATA creation instructions into the OKX transaction
      // Check if we need to create a Wrapped SOL account for SOL swaps
      const needsWrappedSolAccount =
        quote.options.fromToken.address === NATIVE_TOKEN_ADDRESS ||
        quote.options.fromToken.address === SOL_NATIVE_ADDRESS;

      // Check if we need to unwrap Wrapped SOL to native SOL for destination
      const needsWrappedSolUnwrap =
        quote.options.toToken.address === NATIVE_TOKEN_ADDRESS ||
        quote.options.toToken.address === SOL_NATIVE_ADDRESS;

      console.log(`[UNWRAP DEBUG] Checking unwrapping requirements:`);
      console.log(`  - toToken.address: "${quote.options.toToken.address}"`);
      console.log(`  - NATIVE_TOKEN_ADDRESS: "${NATIVE_TOKEN_ADDRESS}"`);
      console.log(`  - SOL_NATIVE_ADDRESS: "${SOL_NATIVE_ADDRESS}"`);
      console.log(`  - needsWrappedSolUnwrap: ${needsWrappedSolUnwrap}`);

      let modifiedTransaction = base64SwapTransaction;

      if (needsWrappedSolAccount) {
        try {
          const fromPubkey = new PublicKey(quote.options.fromAddress);
          const wrappedSolMint = new PublicKey(WRAPPED_SOL_ADDRESS);
          const wrappedSolTokenProgramId = await getTokenProgramOfMint(
            this.conn,
            wrappedSolMint,
          );
          const wrappedSolATA = getSPLAssociatedTokenAccountPubkey(
            fromPubkey,
            wrappedSolMint,
            wrappedSolTokenProgramId,
          );

          const wrappedSolExists = await solAccountExists(
            this.conn,
            wrappedSolATA,
          );

          // Check current WSOL balance if account exists
          let currentWsolBalance = 0;
          if (wrappedSolExists) {
            try {
              const accountInfo =
                await this.conn.getTokenAccountBalance(wrappedSolATA);
              currentWsolBalance = parseInt(accountInfo.value.amount);
              logger.info(
                `WSOL account exists with balance: ${currentWsolBalance / 1e9} SOL (${currentWsolBalance} lamports)`,
              );
            } catch (error) {
              console.warn(`Could not get WSOL balance: ${error}`);
              currentWsolBalance = 0;
            }
          } else {
            logger.info("WSOL account does not exist, will create it");
          }

          const swapAmount = BigInt(quote.options.amount.toString(10));
          const swapAmountNumber = Number(swapAmount);
          const needsMoreFunding =
            !wrappedSolExists || currentWsolBalance < swapAmountNumber;

          logger.info(
            `WSOL funding check: need ${swapAmountNumber / 1e9} SOL, have ${currentWsolBalance / 1e9} SOL, needsMoreFunding: ${needsMoreFunding}`,
          );

          if (needsMoreFunding) {
            // Check if user has enough SOL balance for the swap plus fees
            const userBalance = await this.conn.getBalance(fromPubkey);
            // Use actual estimated gas fee from OKX response instead of hardcoded buffer
            const estimatedGasFee = BigInt(okxQuote.estimateGasFee);
            const bufferAmount = estimatedGasFee + BigInt(1000000); // Add small buffer (0.001 SOL) on top of estimated fee
            const additionalNeeded = wrappedSolExists
              ? Math.max(0, swapAmountNumber - currentWsolBalance)
              : swapAmountNumber;
            const totalNeeded = BigInt(additionalNeeded) + bufferAmount;

            logger.info(
              `SOL balance check: user has ${userBalance / 1e9} SOL, need additional ${additionalNeeded / 1e9} SOL (${Number(totalNeeded) / 1e9} SOL including buffer)`,
            );

            if (BigInt(userBalance) < totalNeeded) {
              throw new Error(
                `Insufficient SOL balance. Need ${Number(totalNeeded) / 1e9} SOL additional but have ${userBalance / 1e9} SOL`,
              );
            }

            const instructions = [];

            if (!wrappedSolExists) {
              const createWrappedSolInstruction =
                getCreateAssociatedTokenAccountIdempotentInstruction({
                  payerPubkey: fromPubkey,
                  ataPubkey: wrappedSolATA,
                  ownerPubkey: fromPubkey,
                  mintPubkey: wrappedSolMint,
                  systemProgramId: SystemProgram.programId,
                  tokenProgramId: new PublicKey(
                    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                  ),
                  associatedTokenProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
                });
              instructions.push(createWrappedSolInstruction);
            }

            // Transfer SOL to fund the Wrapped SOL account (only transfer what's needed)
            const transferInstruction = SystemProgram.transfer({
              fromPubkey: fromPubkey,
              toPubkey: wrappedSolATA,
              lamports: additionalNeeded,
            });
            instructions.push(transferInstruction);

            // Create SyncNative instruction to convert transferred SOL to Wrapped SOL tokens
            const syncNativeInstruction = new TransactionInstruction({
              keys: [
                { pubkey: wrappedSolATA, isSigner: false, isWritable: true },
              ],
              programId: new PublicKey(
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              ),
              data: Buffer.from([17]), // SyncNative instruction discriminator
            });

            instructions.push(syncNativeInstruction);

            // Decode the OKX transaction
            const txBuffer = Buffer.from(base64SwapTransaction, "base64");
            const versionedTx = VersionedTransaction.deserialize(txBuffer);

            // Insert all instructions at start of transaction
            const modifiedTx = await insertInstructionsAtStartOfTransaction(
              this.conn,
              versionedTx,
              instructions,
            );

            // Re-serialize the modified transaction
            modifiedTransaction = Buffer.from(modifiedTx.serialize()).toString(
              "base64",
            );

            logger.info(
              "Added Wrapped SOL account creation, funding, and sync instructions to OKX transaction",
            );
          }
        } catch (error) {
          logger.warn(
            `Could not add Wrapped SOL account creation: ${error.message}`,
          );
          // Continue with original transaction
        }
      }

      const enkryptTransaction: SolanaTransaction = {
        from: quote.options.fromAddress,
        to: quote.options.toAddress,
        serialized: modifiedTransaction,
        type: TransactionType.solana,
        kind: "versioned", // OKX returns VersionedTransactions
        thirdPartySignatures: [],
      };

      // Start with the main swap transaction
      let allTransactions: SolanaTransaction[] = [enkryptTransaction];

      // Handle unwrapping Wrapped SOL to native SOL for destination
      if (needsWrappedSolUnwrap) {
        console.log(`[UNWRAP DEBUG] Creating unwrapping transaction...`);
        try {
          const fromPubkey = new PublicKey(quote.options.fromAddress);
          const toPubkey = new PublicKey(quote.options.toAddress);
          const wrappedSolMint = new PublicKey(WRAPPED_SOL_ADDRESS);
          const wrappedSolTokenProgramId = await getTokenProgramOfMint(
            this.conn,
            wrappedSolMint,
          );

          const wrappedSolATA = getSPLAssociatedTokenAccountPubkey(
            toPubkey,
            wrappedSolMint,
            wrappedSolTokenProgramId,
          );

          const unwrapTransaction = new Transaction();

          const closeAccountInstruction = new TransactionInstruction({
            keys: [
              { pubkey: wrappedSolATA, isSigner: false, isWritable: true },
              { pubkey: fromPubkey, isSigner: false, isWritable: true },
              { pubkey: fromPubkey, isSigner: true, isWritable: false },
            ],
            programId: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            ),
            data: Buffer.from([9]),
          });

          unwrapTransaction.add(closeAccountInstruction);

          // Get latest blockhash
          const { blockhash } = await this.conn.getLatestBlockhash();
          unwrapTransaction.recentBlockhash = blockhash;
          unwrapTransaction.feePayer = fromPubkey; // User pays the fee

          // Serialize the unwrap transaction
          const unwrapTxBuffer = unwrapTransaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          });

          const unwrapTxBase64 = Buffer.from(unwrapTxBuffer).toString("base64");

          const unwrapSolanaTransaction: SolanaTransaction = {
            from: quote.options.fromAddress,
            to: quote.options.toAddress,
            serialized: unwrapTxBase64,
            type: TransactionType.solana,
            kind: "versioned",
            thirdPartySignatures: [],
          };

          // Add the unwrap transaction AFTER the swap transaction
          allTransactions = [enkryptTransaction, unwrapSolanaTransaction];
        } catch (error) {
          logger.error(
            `[UNWRAP DEBUG] Error creating unwrapping transaction:`,
            error,
          );
          logger.warn(
            `Could not create Wrapped SOL unwrapping transaction: ${error.message}`,
          );
          // Continue with just the swap transaction
        }
      } else {
        logger.info(`[UNWRAP DEBUG] No unwrapping needed - single transaction`);
      }

      return {
        transactions: allTransactions,
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

      const quoteParams: Record<string, string> = {
        chainId: "501", // Solana Chain ID
        fromTokenAddress: srcMint.toBase58(),
        toTokenAddress: dstMint.toBase58(),
        amount: amount.toString(10),
        swapMode: "exactIn",
      };

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

      const rawTxData = swapData.tx.data;

      // Validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      const isValidBase64 = base64Regex.test(rawTxData);
      logger.info(`Base64 format validation: ${isValidBase64}`);

      if (!isValidBase64) {
        throw new Error(`Invalid base64 format in transaction data`);
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

    const dstMint = new PublicKey(
      options.toToken.address === NATIVE_TOKEN_ADDRESS
        ? WRAPPED_SOL_ADDRESS
        : options.toToken.address,
    );

    const userPubkey = new PublicKey(options.fromAddress);

    if (
      options.fromToken.address === NATIVE_TOKEN_ADDRESS ||
      options.fromToken.address === SOL_NATIVE_ADDRESS
    ) {
      try {
        const wrappedSolMint = new PublicKey(WRAPPED_SOL_ADDRESS);
        const wrappedSolTokenProgramId = await getTokenProgramOfMint(
          this.conn,
          wrappedSolMint,
        );
        const wrappedSolATA = getSPLAssociatedTokenAccountPubkey(
          userPubkey,
          wrappedSolMint,
          wrappedSolTokenProgramId,
        );

        const wrappedSolExists = await solAccountExists(
          this.conn,
          wrappedSolATA,
        );

        if (!wrappedSolExists) {
        }
      } catch (wrappedSolError) {}
    }

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
      autoSlippage: "true", // Required for Solana
      maxAutoSlippageBps: "100", // Required for Solana
    };

    const swap = await this.getOKXSwap(swapParams, context);
    if (!swap || !swap.tx || !swap.tx.data) {
      throw new Error(`Invalid swap response from OKX API`);
    }

    const okxTransactionData = swap.tx.data;
    const userAddress = options.fromAddress;

    const needsWrappedSolAccount =
      options.fromToken.address === NATIVE_TOKEN_ADDRESS ||
      options.fromToken.address === SOL_NATIVE_ADDRESS;
    let wrappedSolATA: PublicKey | null = null;
    let wrappedSolExists = true;

    if (needsWrappedSolAccount) {
      try {
        const wrappedSolMint = new PublicKey(WRAPPED_SOL_ADDRESS);
        const wrappedSolTokenProgramId = await getTokenProgramOfMint(
          this.conn,
          wrappedSolMint,
        );
        wrappedSolATA = getSPLAssociatedTokenAccountPubkey(
          userPubkey,
          wrappedSolMint,
          wrappedSolTokenProgramId,
        );
        wrappedSolExists = await solAccountExists(this.conn, wrappedSolATA);
      } catch (error) {
        wrappedSolExists = false;
      }
    }

    const txData = await this.createSolanaTransactionFromOKXData(
      okxTransactionData,
      userAddress,
      swap.tx.to, // This is the program address, not destination user address
    );
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

  /**
   * Convert OKX transaction data to proper Solana transaction
   * OKX returns a complete transaction but we need to handle it properly
   */
  private async createSolanaTransactionFromOKXData(
    okxTransactionData: string,
    fromAddress: string,
    programAddress: string,
  ): Promise<string> {
    try {
      const decodingStrategies = [
        {
          name: "base64",
          decode: () => Buffer.from(okxTransactionData, "base64"),
        },
        {
          name: "base58",
          decode: () => Buffer.from(bs58.decode(okxTransactionData)),
        },
        { name: "hex", decode: () => Buffer.from(okxTransactionData, "hex") },
      ];

      for (const strategy of decodingStrategies) {
        try {
          const buffer = strategy.decode();

          if (buffer.length < 10) {
            continue;
          }

          let transaction: Transaction | VersionedTransaction;
          let transactionType = "unknown";

          try {
            transaction = VersionedTransaction.deserialize(buffer);
            transactionType = "versioned";

            const fromPubkey = new PublicKey(fromAddress);

            // Create Wrapped SOL token account instruction
            const wrappedSolMint = new PublicKey(WRAPPED_SOL_ADDRESS);
            const wrappedSolATA = getSPLAssociatedTokenAccountPubkey(
              fromPubkey,
              wrappedSolMint,
              new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // Standard token program
            );

            const createWrappedSolInstruction =
              getCreateAssociatedTokenAccountIdempotentInstruction({
                payerPubkey: fromPubkey,
                ataPubkey: wrappedSolATA,
                ownerPubkey: fromPubkey,
                mintPubkey: wrappedSolMint,
                systemProgramId: SystemProgram.programId,
                tokenProgramId: new PublicKey(
                  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                ),
                associatedTokenProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
              });

            try {
              // Check if this is a versioned transaction with address lookup tables
              if (
                transaction.message &&
                "addressTableLookups" in transaction.message
              ) {
                const lookups = transaction.message.addressTableLookups;

                if (lookups && lookups.length > 0) {
                  // For transactions with lookup tables, return them as-is
                  // Wrapped SOL account creation is now handled at a higher level

                  const reserializedBuffer = transaction.serialize();
                  const result =
                    Buffer.from(reserializedBuffer).toString("base64");
                  logger.info(
                    `  - Returning unmodified OKX transaction to preserve lookup table integrity`,
                  );
                  return result;
                }
              }

              try {
                transaction.message.getAccountKeys();
              } catch (accountKeysError) {
                const reserializedBuffer = transaction.serialize();
                const result =
                  Buffer.from(reserializedBuffer).toString("base64");
                return result;
              }

              // CRITICAL FIX: Don't modify the OKX transaction - it breaks serialization
              // Instead, return the original transaction and let the extension handle account creation

              const reserializedBuffer = transaction.serialize();
              const result = Buffer.from(reserializedBuffer).toString("base64");
              logger.info(
                `  - Returning unmodified OKX transaction to prevent corruption`,
              );
              return result;
            } catch (modifyError) {
              // Fallback to original transaction
              const reserializedBuffer = transaction.serialize();
              const result = Buffer.from(reserializedBuffer).toString("base64");
              return result;
            }
          } catch (versionedError) {
            throw versionedError; // Skip legacy fallback, it's broken
          }
        } catch (strategyError) {
          continue;
        }
      }

      // If all strategies failed
      logger.warn(
        `  - All decoding strategies failed for OKX transaction data`,
      );

      // Last resort: Return the original OKX data and let extension handle it
      logger.info(`  - Using last resort: returning OKX data as-is`);
      return okxTransactionData;
    } catch (error) {
      logger.error(
        `Failed to create Solana transaction from OKX data: ${error}`,
      );
      throw new Error(`Failed to create Solana transaction: ${error.message}`);
    }
  }
}
