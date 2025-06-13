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
} from "../../types";
import {
  DEFAULT_SLIPPAGE,
  FEE_CONFIGS,
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";
import { DebugLogger } from "@enkryptcom/utils";
import {
  OKXQuoteResponse,
  OKXSwapParams,
  OKXSwapResponse,
  OKXTokenInfo,
} from "./types";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();

const logger = new DebugLogger("swap:okx");

const OKX_API_URL = "https://web3.okx.com";
const OKX_TOKENS_URL = "/api/v5/dex/aggregator/all-tokens";
const OKX_QUOTE_URL = "/api/v5/dex/aggregator/quote";
const OKX_SWAP_URL = "/api/v5/dex/aggregator/swap";

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
    this.okxTokens = new Map(okxTokenList.map((t) => [t.address, t]));

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

      const dstATAExists = await solAccountExists(this.conn, dstATAPubkey);
      let rentFees = 0;

      if (!dstATAExists) {
        const extraRentFee = await this.conn.getMinimumBalanceForRentExemption(
          SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
        );
        rentFees += extraRentFee;
      }

      return {
        fromTokenAmount: toBN(quote.inAmount),
        toTokenAmount: toBN(
          Math.floor((1 - feeConf.fee) * Number(quote.outAmount))
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

  /**
   * Get swap transaction details
   */
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

      logger.info(
        `getSwap: Quote inAmount:  ${okxQuote.inAmount} ${quote.options.fromToken.symbol}`,
      );
      logger.info(
        `getSwap: Quote outAmount: ${okxQuote.outAmount} ${quote.options.toToken.symbol}`,
      );

      return {
        transactions: [enkryptTransaction],
        fromTokenAmount: toBN(okxQuote.inAmount),
        toTokenAmount: toBN(
          Math.floor((1 - feePercentage / 100) * Number(okxQuote.outAmount))
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
    const params = {
      chainId: "501", // Solana Chain ID
    };

    const timestamp = new Date().toISOString();
    const requestPath = OKX_TOKENS_URL;
    const queryString = "?" + new URLSearchParams(params).toString();
    const headers = this.getHeaders(timestamp, "GET", requestPath, queryString);

    const response = await fetch(`${OKX_API_URL}${requestPath}${queryString}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get OKX tokens: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
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
    const { srcMint, dstMint, amount, slippageBps, referralFeeBps } = params;

    const quoteParams = {
      chainId: "501", // Solana Chain ID
      fromToken: srcMint.toBase58(),
      toToken: dstMint.toBase58(),
      amount: amount.toString(10),
      slippage: slippageBps.toString(10),
      feeBps: referralFeeBps.toString(10),
    };

    const timestamp = new Date().toISOString();
    const requestPath = OKX_QUOTE_URL;
    const queryString = "?" + new URLSearchParams(quoteParams).toString();
    const headers = this.getHeaders(timestamp, "GET", requestPath, queryString);

    const response = await fetch(`${OKX_API_URL}${requestPath}${queryString}`, {
      method: "GET",
      headers,
      signal: context?.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to get OKX quote: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get swap transaction from OKX API
   */
  private async getOKXSwap(
    params: OKXSwapParams,
    context?: { signal?: AbortSignal },
  ): Promise<OKXSwapResponse> {
    const timestamp = new Date().toISOString();
    const requestPath = OKX_SWAP_URL;
    const headers = this.getHeaders(timestamp, "POST", requestPath, "");

    const response = await fetch(`${OKX_API_URL}${requestPath}`, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
      signal: context?.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to get OKX swap: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Generate headers for OKX API requests
   */
  private getHeaders(
    timestamp: string,
    method: string,
    requestPath: string,
    queryString: string,
  ): HeadersInit {
    const apiKey = process.env.OKX_API_KEY;
    const secretKey = process.env.OKX_SECRET_KEY;
    const apiPassphrase = process.env.OKX_API_PASSPHRASE;
    const projectId = process.env.OKX_PROJECT_ID;

    if (!apiKey || !secretKey || !apiPassphrase || !projectId) {
      throw new Error("Missing required environment variables");
    }

    const stringToSign = timestamp + method + requestPath + queryString;
    return {
      "Content-Type": "application/json",
      "OK-ACCESS-KEY": apiKey,
      "OK-ACCESS-SIGN": CryptoJS.enc.Base64.stringify(
        CryptoJS.HmacSHA256(stringToSign, secretKey),
      ),
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": apiPassphrase,
      "OK-ACCESS-PROJECT": projectId,
    };
  }

  /**
   * Query swap info from OKX API
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
    const feeConf = FEE_CONFIGS[this.name][meta.walletIdentifier];
    if (!feeConf) {
      throw new Error("Something went wrong: no fee config for OKX swap");
    }

    const fromPubkey = new PublicKey(options.fromAddress);
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

    // Get quote
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

    // Get swap transaction
    const swap = await this.getOKXSwap(
      {
        userPublicKey: fromPubkey.toBase58(),
        quoteResponse: quote,
        wrapAndUnwrapSol: true,
        useSharedAccounts: true,
        dynamicComputeUnitLimit: true,
      },
      context,
    );

    // Calculate rent fees
    const dstTokenProgramId = await getTokenProgramOfMint(this.conn, dstMint);
    const dstATAPubkey = getSPLAssociatedTokenAccountPubkey(
      toPubkey,
      dstMint,
      dstTokenProgramId,
    );

    const dstATAExists = await solAccountExists(this.conn, dstATAPubkey);
    let rentFees = 0;

    if (!dstATAExists) {
      const extraRentFee = await this.conn.getMinimumBalanceForRentExemption(
        SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
      );
      rentFees += extraRentFee;
    }

    return {
      okxQuote: quote,
      base64SwapTransaction: swap.swapTransaction,
      feePercentage: feeConf.fee * 100,
      rentFees,
    };
  }
}
