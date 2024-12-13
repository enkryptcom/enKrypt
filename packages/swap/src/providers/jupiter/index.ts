/* eslint-disable no-use-before-define, no-new, no-constant-condition, no-restricted-syntax, no-labels */

import { NetworkNames } from "@enkryptcom/types";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { toBN } from "web3-utils";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "../../utils/approvals";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  extractComputeBudget,
  getCreateAssociatedTokenAccountIdempotentInstruction,
  getSPLAssociatedTokenAccountPubkey,
  getTokenProgramOfMint,
  insertInstructionsAtStartOfTransaction,
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
import {
  JupiterQuoteResponse,
  JupiterSwapParams,
  JupiterSwapResponse,
  JupiterTokenInfo,
} from "./types";
import { DebugLogger } from "@enkryptcom/utils";

const logger = new DebugLogger("swap:jupiter");

/**
 * # Jupiter swap flow
 *
 * @see https://station.jup.ag/docs/APIs/swap-api
 * @see https://station.jup.ag/api-v6/introduction
 * @see https://station.jup.ag/api-v6/get-quote
 * @see https://station.jup.ag/api-v6/post-swap
 * @see https://station.jup.ag/guides/jupiter-swap/how-referral-works
 * @see https://referral.jup.ag/
 * @see https://referral.jup.ag/api
 * @see https://github.com/TeamRaccoons/referral
 *
 * Jupiter requires referral account. A rferral account can be created on the
 * Jupiter referral dashboard https://referral.jup.ag/dashboard
 *
 * After you have a referral account (associated with your Solana address) you
 * can create token accounts (ATA's) so that it can receive referral fees.
 * We inject an instruction in swap transactions to create a referral fee ATA
 * if the user tries to swap a token that doesn't one yet.
 *
 * ## Swap flow
 *
 * 1. Request a quote from the Jupiter swap API
 * 2. Request a swap transaction from the Jupiter swap API with the quote provided
 * 3. Decompile, modify and recompile the transaction to add an instruction that
 *    creates the referrer ATA to receive platform fees, if required
 * 4. Sign the transaction
 * 5. Execute the transaction
 *
 * ## Terminology
 *
 * - Mint: a mint is a unique identifier for an SPL token, typically represented by a public key.
 * - SPL (Solana Program Library): A collection of on-chain programs designed to support the Solana ecosystem.
 * - SPL Token: A type of token on the Solana blockchain that adheres to the standards set by SPL Token
 *     programs, analogous to ERC20 tokens on Ethereum. There are two main SPL Token programs:
 *     the original "SPL Token Program" and the updated "2022 SPL Token Program."
 * - ATA (Associated Token Account): An account that holds token balances and other program-associated data
 *     for a specific address on Solana. ATAs are necessary to link an address with its assets, such as
 *     tokens. The maintenance of an ATA involves a periodic rent, deducted from its balance, which varies
 *     based on the data storage required. For instance, token programs typically require 165 bytes per ATA.
 *     An ATA that maintains at least two years' worth of rent in its balance qualifies as rent-exempt.
 *
 * [Solana 101](https://2501babe.github.io/posts/solana101.html)
 */

const JUPITER_TOKENS_URL = "https://tokens.jup.ag/tokens?tags=verified";

/**
 * @see https://station.jup.ag/docs/APIs/swap-api
 * @see https://station.jup.ag/api-v6/introduction
 */
const JUPITER_API_URL = "https://quote-api.jup.ag/v6/";

/**
 * @see https://solscan.io/account/45ruCyfdRkWpRNGEqWzjCiXRHkZs8WXCLQ67Pnpye7Hp
 *
 * Manages referral fees
 */
const JUPITER_REFERRAL_VAULT_PUBKEY = new PublicKey(
  "45ruCyfdRkWpRNGEqWzjCiXRHkZs8WXCLQ67Pnpye7Hp",
);

/**
 * @see https://solscan.io/account/REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3
 *
 * Program targetted by instructions
 */
const JUPITER_REFERRAL_PROGRAM_PUBKEY = new PublicKey(
  "REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3",
);

/**
 * Storage of a token ATA
 *
 * Required to calculate the extra cost if the swap fee if the swap needs to create a referral fee account
 */
const JUPITER_REFERRAL_ATA_ACCOUNT_SIZE_BYTES = 165;

// Jupiter API Tokens

/**
 * Jupiter is a DEX on Solana
 *
 * - App: https://jup.ag/
 * - Documentation: https://station.jup.ag/docs/
 * - Token lists: ttps://station.jup.ag/docs/token-list
 * - https://token s .jup.ag/tokens?tags=verified
 */
export class Jupiter extends ProviderClass {
  network: SupportedNetworkName;

  name = ProviderName.jupiter;

  conn: Connection;

  /** Initialised in `init` */
  fromTokens: ProviderFromTokenResponse;

  /** initialised in `init` */
  toTokens: ProviderToTokenResponse;

  /** Initialised in `init` address -> Jupiter token info */
  jupiterTokens: Map<string, JupiterTokenInfo>;

  constructor(conn: Connection, network: SupportedNetworkName) {
    super();
    this.network = network;
    this.conn = conn;

    this.fromTokens = {};
    this.toTokens = {};
    this.jupiterTokens = new Map();
  }

  /**
   *
   * Initialise`fromTokens` and`toTokens`
   * @param enkryptTokenList Tokens with prices, from swaplists on`https://github.com/enkryptcom/dynamic-data`
   *
   * ```sh
   * curl -sL https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/SOLANA.json | jq -C | less -N
   * ```
   */
  async init(enkryptTokenList: TokenType[]): Promise<void> {
    // Only supports Solana
    if ((this.network as unknown as string) !== NetworkNames.Solana) return;

    /** List of Jupiter tokens */
    const jupiterTokenList = await getJupiterTokens();

    // Inner join jupiter tokens with our tokens from`https://github.com/enkryptcom/dynamic-data`
    // and save the results

    /** Mapping of cased token address -> Jupiter token info */
    this.jupiterTokens = new Map(jupiterTokenList.map((t) => [t.address, t]));

    /** Intersection of token list & jupiter tokens */
    this.toTokens[this.network] ??= {};
    for (let i = 0, len = enkryptTokenList.length; i < len; i++) {
      const enkryptToken = enkryptTokenList[i];
      let isTradeable = false;
      if (enkryptToken.address === NATIVE_TOKEN_ADDRESS) {
        // Jupiter swap API auto unwraps SOL (it's configurable)
        // Jupiter doesn't send back native SOL
        isTradeable = this.jupiterTokens.has(WRAPPED_SOL_ADDRESS);
      } else {
        isTradeable = this.jupiterTokens.has(enkryptToken.address);
      }

      // Not supported
      if (!isTradeable) continue;

      // Token is supported on Jupiter
      this.fromTokens[enkryptToken.address] = enkryptToken;
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
   * Query the Jupiter Swap API for a quote, a swap transaction, transform the swap transaction if needed
   * and extract additional information like rent fees and compute budget
   */
  private async querySwapInfo(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal },
  ): Promise<{
    jupiterQuote: JupiterQuoteResponse;
    jupiterSwap: JupiterSwapResponse;
    base64SwapTransaction: string;
    feePercentage: number;
    slippagePercentage: number;
    computeBudget: number;
    rentFees: number;
  }> {
    const signal = context?.signal;

    const feeConf = FEE_CONFIGS[this.name][meta.walletIdentifier];

    if (!feeConf) {
      throw new Error("Something went wrong: no fee config for Jupiter swap");
    }

    const referrerPubkey = new PublicKey(feeConf.referrer);

    /** Jupiter API requires an integer for fee bps so we must round */
    const feeBps = Math.round(100 * feeConf.fee);

    const fromPubkey = new PublicKey(options.fromAddress);
    const toPubkey = new PublicKey(options.toAddress);

    /**
     * Source token.
     *
     * For native SOL we use the wrapped SOL address
     */
    let srcMint: PublicKey;
    if (options.fromToken.address === NATIVE_TOKEN_ADDRESS) {
      srcMint = new PublicKey(WRAPPED_SOL_ADDRESS);
    } else {
      srcMint = new PublicKey(options.fromToken.address);
    }

    /**
     * Pubkey of the destination token
     *
     * For native SOL we use the wrapped SOL address
     */
    let dstMint: PublicKey;
    if (options.toToken.address === NATIVE_TOKEN_ADDRESS) {
      dstMint = new PublicKey(WRAPPED_SOL_ADDRESS);
    } else {
      dstMint = new PublicKey(options.toToken.address);
    }

    const referrerATAPubkey = getJupiterReferrerAssociatedTokenAccount(
      referrerPubkey,
      srcMint,
    );

    const referrerATAExists = await solAccountExists(
      this.conn,
      referrerATAPubkey,
    );

    /** Jupiter API requires an integer for slippage bps so we must round */
    const slippageBps = Math.round(
      100 * parseFloat(meta.slippage || DEFAULT_SLIPPAGE),
    );

    const quote = await getJupiterQuote(
      {
        srcMint,
        dstMint,
        amount: BigInt(options.amount.toString(10)),
        slippageBps,
        referralFeeBps: feeBps,
      },
      { signal },
    );

    const dstTokenProgramId = await getTokenProgramOfMint(this.conn, dstMint);
    const dstATAPubkey = getSPLAssociatedTokenAccountPubkey(
      toPubkey,
      dstMint,
      dstTokenProgramId,
    );

    const swap = await getJupiterSwap(
      {
        quote,
        signerPubkey: fromPubkey,
        referrerATAPubkey,
        dstATAPubkey,
      },
      { signal },
    );

    let tx = VersionedTransaction.deserialize(
      Buffer.from(swap.swapTransaction, "base64"),
    );

    const srcTokenProgramId = await getTokenProgramOfMint(this.conn, srcMint);

    /** Rent from having to create ATA accounts for the wallet & mint and the referral fee holder & mint */
    let rentFees = 0;

    /** Instructions to be inserted at the start of the transaction to create requisite accounts */
    const extraInstructions: TransactionInstruction[] = [];

    if (referrerATAExists) {
      logger.info(
        `querySwapInfo: Referrer ATA already exists. No need to record additional rent fees.` +
          ` ATA pubkey: ${referrerATAPubkey.toBase58()},` +
          ` Source mint: ${srcMint.toBase58()}`,
      );
    } else {
      // The referral fee ATA account needs to be created or else we can't receive fees for this transaction
      const extraRentFees = await this.conn.getMinimumBalanceForRentExemption(
        JUPITER_REFERRAL_ATA_ACCOUNT_SIZE_BYTES,
      );

      // Get the instruction that creates the Jupiter referral ATA account
      const instruction = getJupiterInitialiseReferralTokenAccountInstruction({
        payerPubkey: fromPubkey,
        programId: JUPITER_REFERRAL_PROGRAM_PUBKEY,
        vaultPubkey: JUPITER_REFERRAL_VAULT_PUBKEY,
        referralAccountPubkey: referrerPubkey,
        referralATAPubkey: referrerATAPubkey,
        mintPubkey: srcMint,
        systemProgramId: SystemProgram.programId,
        tokenProgramId: srcTokenProgramId,
      });

      extraInstructions.push(instruction);
      rentFees += extraRentFees;

      logger.info(
        `querySwapInfo: Referrer ATA does not exist. Updating transaction with instruction to create it.` +
          ` Referral ATA pubkey: ${referrerATAPubkey.toBase58()},` +
          ` Rent: ${extraRentFees} lamports,` +
          ` Total Rent: ${extraRentFees} lamports`,
      );
    }

    // Will the destination token ATA for the swapper need to be created?
    const dstATAExists = await solAccountExists(this.conn, dstATAPubkey);

    if (dstATAExists) {
      logger.info(
        `querySwapInfo: Wallet destination mint ATA already exists. No need to record additional rent fees.` +
          ` ATA pubkey: ${dstATAPubkey.toBase58()},` +
          ` Destination mint: ${dstMint.toBase58()}`,
      );
    } else {
      const extraRentFee = await this.conn.getMinimumBalanceForRentExemption(
        SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
      );

      const instruction = getCreateAssociatedTokenAccountIdempotentInstruction({
        payerPubkey: fromPubkey,
        ataPubkey: dstATAPubkey,
        ownerPubkey: toPubkey,
        mintPubkey: dstMint,
        systemProgramId: SystemProgram.programId,
        tokenProgramId: dstTokenProgramId,
        associatedTokenProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
      });

      rentFees += extraRentFee;
      extraInstructions.push(instruction);

      logger.info(
        `querySwapInfo: Wallet destination mint ATA does not exist, registering custom instruction to create it.` +
          ` Adding ATA rent to extra transaction fees.` +
          ` ATA pubkey: ${dstATAPubkey.toBase58()},` +
          ` Destination mint: ${dstMint.toBase58()},` +
          ` Rent: ${extraRentFee} lamports,` +
          ` Total rent: ${rentFees} lamports`,
      );
    }

    if (extraInstructions.length) {
      tx = await insertInstructionsAtStartOfTransaction(
        this.conn,
        tx,
        extraInstructions,
      );
    }

    const computeBudget = extractComputeBudget(tx);

    return {
      feePercentage: feeBps / 100,
      slippagePercentage: slippageBps / 100,
      jupiterSwap: swap,
      jupiterQuote: quote,
      base64SwapTransaction: Buffer.from(tx.serialize()).toString("base64"),
      rentFees,
      computeBudget,
    };
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal },
  ): Promise<null | ProviderQuoteResponse> {
    if (options.toToken.networkInfo.name !== SupportedNetworkName.Solana) {
      logger.info(
        `getQuote: ignoring quote request to network ${options.toToken.networkInfo.name},` +
          ` cross network swaps not supported`,
      );
      return null;
    }

    const { jupiterQuote, rentFees, computeBudget, feePercentage } =
      await this.querySwapInfo(options, meta, context);

    // Jupiter swaps have four different kinds of fees:
    // 1. Transaction base fees: number of signatures * lamports per signature
    // 2. Transaction priority fees (sometimes): set via the Compute Budget program's "SetComputeUnitPrice"
    // 3. Transaction referral fees: fees paid to MEW (97.5%) and Jupiter (2.5%) as the wallet provider
    // 4. Rent for ATA accounts that may need to be created; the referral fee account and mint account

    logger.info(
      `getQuote: Quote inAmount: ${jupiterQuote.inAmount} ${options.fromToken.symbol}`,
    );
    logger.info(
      `getQuote: Quote outAmount: ${jupiterQuote.outAmount} ${options.toToken.symbol}`,
    );

    const result: ProviderQuoteResponse = {
      fromTokenAmount: toBN(jupiterQuote.inAmount),
      toTokenAmount: toBN(
        Math.floor((1 - feePercentage) * Number(jupiterQuote.outAmount))
          .toFixed(10)
          .replace(/\.?0+$/, ""),
      ),
      totalGaslimit: computeBudget,
      additionalNativeFees: toBN(rentFees),
      provider: this.name,
      quote: {
        options,
        meta,
        provider: this.name,
      },
      minMax: {
        // TODO: how can I get these limits?
        minimumFrom: toBN("1"),
        maximumFrom: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
        minimumTo: toBN("1"),
        maximumTo: toBN(TOKEN_AMOUNT_INFINITY_AND_BEYOND),
      },
    };

    return result;
  }

  async getSwap(
    quote: SwapQuote,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderSwapResponse> {
    const { feePercentage, jupiterQuote, base64SwapTransaction, rentFees } =
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
      `getSwap: Quote inAmount:  ${jupiterQuote.inAmount} ${quote.options.fromToken.symbol}`,
    );
    logger.info(
      `getSwap: Quote outAmount: ${jupiterQuote.outAmount} ${quote.options.toToken.symbol}`,
    );

    const result: ProviderSwapResponse = {
      transactions: [enkryptTransaction],
      fromTokenAmount: toBN(jupiterQuote.inAmount),
      toTokenAmount: toBN(
        Math.floor((1 - feePercentage) * Number(jupiterQuote.outAmount))
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

    return result;
  }

  async getStatus(options: StatusOptions): Promise<TransactionStatus> {
    if (options.transactions.length !== 1) {
      throw new TypeError(
        `JupiterSwap.getStatus: Expected one transaction hash but got ${options.transactions.length}`,
      );
    }
    const [{ sentAt, hash }] = options.transactions;
    const txResponse = await this.conn.getTransaction(hash, {
      maxSupportedTransactionVersion: 0,
    });

    if (txResponse == null) {
      // Consider dropped (/failed) if it's still null after 3 minutes
      // (block hashes expire after 2 minutes so 3 minutes gives 1 minute of leeway)
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
}

/**
 * Request all verified tokens available on Jupiter swap
 *
 * (With retry, backoff, and timeouts)
 *
 * @see https://station.jup.ag/api-v6/get-quote
 */
async function getJupiterTokens(abortable?: {
  signal?: AbortSignal;
}): Promise<JupiterTokenInfo[]> {
  const signal = abortable?.signal;

  const url = JUPITER_TOKENS_URL;
  let failed = false;
  let tokens: JupiterTokenInfo[];
  const backoff = [0, 100, 500, 1000, 2_000, 4_000];
  let backoffi = 0;
  let errRef: undefined | { err: Error };

  while (true) {
    if (signal?.aborted) {
      // Context aborted
      throw signal.reason;
    }

    if (backoffi >= backoff.length) {
      // Failed after too many attempts
      throw new Error(
        `Failed to get Jupiter tokens after ${backoffi} retries: ${String(
          errRef?.err ?? "???",
        )}`,
      );
    }

    if (backoff[backoffi] > 0) {
      // Previous request failed, wait before retrying
      logger.info(`getJupiterTokens: Retrying after ${backoff[backoffi]}ms...`);
      await sleep(backoff[backoffi], abortable);
    }

    /** Cancels the HTTP request */
    const aborter = new AbortController();

    /** Fired when the request takes too long */
    const onTimeout = () => {
      aborter.abort(new Error(`HTTP request timed out ${url}`));
    };

    /** Cancel this request if the context cancels */
    const onAbort = () => {
      aborter.abort(signal!.reason);
    };

    /** Cleanup timeouts and aborters */
    const cleanupRequest = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
    };

    /** Times out the request */
    const timeout = setTimeout(onTimeout, 30_000);
    signal?.addEventListener("abort", onAbort);

    try {
      logger.info(
        `getJupiterTokens: Initiating HTTP request for Jupiter tokens ${url}`,
      );
      const res = await fetch(url, {
        signal: aborter.signal,
        headers: [["Accept", "application/json"]],
        redirect: "follow",
        keepalive: true,
      });
      if (!res.ok) {
        let msg = await res
          .text()
          .catch(
            (err: Error) => `Failed to decode response text: ${String(err)}`,
          );
        const msglen = msg.length;
        if (msglen > 512 + 7 + 3 + msglen.toString().length) {
          msg = `${msg.slice(0, 512)}... (512/${msglen})`;
        }
        switch (res.status) {
          case 400:
          case 401:
          case 402:
          case 403:
          case 404:
          case 405:
          case 500:
            failed = true;
            break;
          default: /* noop */
        }
        throw new Error(
          `Failed to get Jupiter tokens, HTTP response returned not-ok status ${
            res.status
          } ${res.statusText || "<no status text>"}: ${msg}`,
        );
      }
      tokens = (await res.json()) as JupiterTokenInfo[];

      if (!tokens) {
        throw new Error(
          "Failed to get Jupiter tokens: something went wrong and result is falsy",
        );
      }

      return tokens;
    } catch (err) {
      if (signal?.aborted) throw signal.reason;
      if (failed) throw err;
      logger.info(
        `getJupiterTokens: Failed to get Jupiter tokens on attempt ${backoffi + 1}/${
          backoff.length
        }: ${String(err)}`,
      );
      errRef ??= { err: err as Error };
    } finally {
      cleanupRequest();
    }
    backoffi += 1;
  }
}

/**
 * Request a quote for a swap pair from the Jupiter API
 *
 * (With retry, backoff, and timeouts)
 *
 * @see https://station.jup.ag/api-v6/get-quote
 */
async function getJupiterQuote(
  params: {
    /** Source token pubkey (address) */
    srcMint: PublicKey;
    /** Destination token pubkey (address) */
    dstMint: PublicKey;
    /** How many of the source tokens? */
    amount: bigint;
    /** Integer */
    slippageBps?: number;
    /** Integer */
    referralFeeBps?: number;
  },
  abortable?: {
    signal?: AbortSignal;
  },
): Promise<JupiterQuoteResponse> {
  const { srcMint, dstMint, amount, slippageBps, referralFeeBps } = params;

  if (slippageBps != null) {
    if (!Number.isSafeInteger(slippageBps)) {
      throw new TypeError(
        `Invalid slippageBps: ${slippageBps} must be a safe integer`,
      );
    }
    if (slippageBps < 0) {
      throw new Error(`Invalid slippageBps: ${slippageBps} must be >= 0`);
    }
  }

  if (referralFeeBps != null) {
    if (!Number.isSafeInteger(referralFeeBps)) {
      throw new TypeError(
        `Invalid referralFeeBps: ${referralFeeBps} must be a safe integer`,
      );
    }
    if (referralFeeBps < 0) {
      throw new TypeError(
        `Invalid referralFeeBps: ${referralFeeBps} must be >= 0`,
      );
    }
  }

  const quoteParams: [key: string, value: string][] = [];
  quoteParams.push(["inputMint", srcMint.toBase58()]);
  quoteParams.push(["outputMint", dstMint.toBase58()]);
  quoteParams.push(["amount", amount.toString(10)]);
  if (slippageBps != null) {
    quoteParams.push(["slippageBps", slippageBps.toString(10)]);
  }
  if (referralFeeBps != null) {
    quoteParams.push(["platformFeeBps", referralFeeBps.toString()]);
  }
  quoteParams.push(["swapMode", "ExactIn"]);
  const queryString = new URLSearchParams(quoteParams);
  const url = `${JUPITER_API_URL}quote?${queryString.toString()}`;

  let failed = false;
  let quote: JupiterQuoteResponse;
  const backoff = [0, 100, 500, 1000, 2_000, 4_000];
  let backoffi = 0;
  let errRef: undefined | { err: Error };

  while (true) {
    abortable?.signal?.throwIfAborted();

    if (backoffi >= backoff.length) {
      // Failed after too many attempts
      throw new Error(
        `Failed to get Jupiter quote after ${backoffi} retries at url ${url}: ${String(
          errRef?.err ?? "???",
        )}`,
      );
    }

    if (backoff[backoffi] > 0) {
      // Previous request failed, wait before retrying
      logger.info(
        `getJupiterQuote: Retrying ${url} after ${backoff[backoffi]}ms...`,
      );
      await sleep(backoff[backoffi], abortable);
    }

    /** Cancels the HTTP request */
    const aborter = new AbortController();

    /** Fired when the request takes too long to complete */
    const onTimeout = () => {
      aborter.abort(new Error(`HTTP request timed out ${url}`));
    };

    /** Cancel this request if the context cancels */
    const onAbort = () => {
      aborter.abort(abortable!.signal!.reason);
    };

    /** Cleanup timeouts and aborters */
    const cleanup = () => {
      clearTimeout(timeout);
      abortable?.signal?.removeEventListener("abort", onAbort);
    };

    /** Times out the request */
    const timeout = setTimeout(onTimeout, 30_000);
    abortable?.signal?.addEventListener("abort", onAbort);

    try {
      logger.info(
        `getJupiterQuote: Initiating HTTP request for Jupiter quote ${url}`,
      );
      const res = await fetch(url, {
        signal: aborter.signal,
        headers: [["Accept", "application/json"]],
        redirect: "follow",
        keepalive: true,
      });
      if (!res.ok) {
        let msg = await res
          .text()
          .catch(
            (err: Error) => `Failed to decode response text: ${String(err)}`,
          );
        const msglen = msg.length;
        if (msglen > 512 + 7 + 3 + msglen.toString().length) {
          msg = `${msg.slice(0, 512)}... (512/${msglen})`;
        }
        switch (res.status) {
          case 400:
          case 401:
          case 402:
          case 403:
          case 404:
          case 405:
          case 500:
            failed = true;
            break;
          default: /* noop */
        }
        throw new Error(
          `Failed to get Jupiter quote, HTTP response returned not-ok status ${
            res.status
          } ${res.statusText || "<no status text>"} at url ${url}: ${msg}`,
        );
      }
      quote = (await res.json()) as JupiterQuoteResponse;

      if (!quote) {
        throw new Error(
          `Failed to get Jupiter quote at url ${url}, something went wrong and result is falsy`,
        );
      }

      return quote;
    } catch (err) {
      if (abortable?.signal?.aborted) throw abortable?.signal.reason;
      if (failed) throw err;
      console.warn(
        `[getJupiterQuote] Failed to get Jupiter quote on attempt ${
          backoffi + 1
        }/${backoff.length}: ${String(err)}`,
      );
      errRef ??= { err: err as Error };
    } finally {
      cleanup();
    }
    backoffi += 1;
  }
}

/**
 * Request a swap transaction for a given quote from the Jupiter swap API
 *
 * (With retry, backoff, and timeouts)
 *
 * @see https://station.jup.ag/api-v6/post-swap
 */
async function getJupiterSwap(
  params: {
    /** Base58 signer address that pays for the transaction */
    signerPubkey: PublicKey;
    /** Destination SPL ATA account that will receive ownership of the destination tokens */
    dstATAPubkey?: PublicKey;
    /** Base58 referrer address (created in the Jupiter dashboard, not the ATA address) */
    referrerATAPubkey?: PublicKey;
    /** Response from Jupiter API */
    quote: JupiterQuoteResponse;
  },
  abortable?: {
    signal?: AbortSignal;
  },
): Promise<JupiterSwapResponse> {
  const { signerPubkey, dstATAPubkey, quote, referrerATAPubkey } = params;

  const swapParams: JupiterSwapParams = {
    userPublicKey: signerPubkey.toBase58(),
    feeAccount: referrerATAPubkey?.toBase58(),
    quoteResponse: quote,
    destinationTokenAccount: dstATAPubkey?.toBase58(),
    /** @see https://station.jup.ag/api-v6/post-swap */
    prioritizationFeeLamports: {
      /**
       * The automatic fee seems low and frequently causes transactions
       * to be dropped when traffic is high
       *
       * This number has been arbitrary selected from manual testing @ 2024-11-21
       * where there's been a bunch of network activity causing dropped transactions
       */
      autoMultiplier: 6,
    },
  };

  const url = `${JUPITER_API_URL}swap`;
  let failed = false;
  let swap: JupiterSwapResponse;
  const backoff = [0, 100, 500, 1000, 2_000, 4_000];
  let backoffi = 0;
  let errRef: undefined | { err: Error };

  while (true) {
    abortable?.signal?.throwIfAborted();

    if (backoffi >= backoff.length) {
      // Failed after too many attempts
      throw new Error(
        `Failed to get Jupiter swap after ${backoffi} retries at url ${url}: ${String(
          errRef?.err ?? "???",
        )}`,
      );
    }

    if (backoff[backoffi] > 0) {
      // Previous request failed, wait before retrying
      logger.info(
        `getJupiterSwap: Retrying ${url} after ${backoff[backoffi]}ms...`,
      );
      await sleep(backoff[backoffi], abortable);
    }

    /** Cancels the HTTP request */
    const aborter = new AbortController();

    /** Fired when the HTTP request takes too long */
    const onTimeout = () => {
      aborter.abort(new Error(`HTTP request timed out ${url}`));
    };

    /** Cancel this request if the context cancels */
    const onAbort = () => {
      aborter.abort(abortable.signal!.reason);
    };

    /** Cleanup timeouts and aborters */
    const cleanupRequest = () => {
      clearTimeout(timeout);
      abortable?.signal?.removeEventListener("abort", onAbort);
    };

    /** Times out the request */
    const timeout = setTimeout(onTimeout, 30_000);
    abortable?.signal?.addEventListener("abort", onAbort);

    try {
      logger.info(
        `getJupiterSwap: Initiating HTTP request for Jupiter swap ${url}`,
      );
      const res = await fetch(url, {
        signal: aborter.signal,
        method: "POST",
        headers: [
          ["Accept", "application/json"],
          ["Content-Type", "application/json"],
        ],
        body: JSON.stringify(swapParams),
        redirect: "follow",
        keepalive: true,
      });
      if (!res.ok) {
        let msg = await res
          .text()
          .catch(
            (err: Error) => `Failed to decode response text: ${String(err)}`,
          );
        const msglen = msg.length;
        if (msglen > 512 + 7 + 3 + msglen.toString().length) {
          msg = `${msg.slice(0, 512)}... (512/${msglen})`;
        }
        switch (res.status) {
          case 400:
          case 401:
          case 402:
          case 403:
          case 404:
          case 405:
          case 500:
            failed = true;
            break;
          default: /* noop */
        }
        throw new Error(
          `Failed to get Jupiter swap, HTTP response returned not-ok status ${
            res.status
          } ${res.statusText || "<no status text>"} at url ${url}: ${msg}`,
        );
      }

      swap = (await res.json()) as JupiterSwapResponse;

      if (!quote) {
        throw new Error(
          `Failed to get Jupiter swap at url ${url}, something went wrong and result is falsy`,
        );
      }

      return swap;
    } catch (err) {
      if (failed) throw err;
      logger.info(
        `getJupiterSwap: Failed to get Jupiter swap on attempt ${backoffi + 1}/${
          backoff.length
        }: ${String(err)}`,
      );
      errRef ??= { err: err as Error };
    } finally {
      cleanupRequest();
    }
    backoffi += 1;
  }
}

/**
 * Get the referral ATA address that will receive your referral fees
 *
 * The ATA address is owned by the Jupiter referrer program which gives you the
 * ability to claim (withdraw) your assets. The address is specified in the swap
 * documentation https://station.jup.ag/api-v6/post-swap in the `feeAccount`
 * section
 *
 * @param referrerPubkey  Jupiter referrer acount address (from Jupiter referrer dashboard)
 * @param mintPubkey      SPL token address
 */
function getJupiterReferrerAssociatedTokenAccount(
  referrerPubkey: PublicKey,
  mintPubkey: PublicKey,
): PublicKey {
  /** `feeAccount` section of https://station.jup.ag/api-v6/post-swap */
  const referrerAccountSeeds = [
    Buffer.from("referral_ata"),
    // Your referrer address that the Jupiter referral program gave you
    referrerPubkey.toBuffer(),
    mintPubkey.toBuffer(),
  ];
  const [referrerATAPubkey] = PublicKey.findProgramAddressSync(
    referrerAccountSeeds,
    JUPITER_REFERRAL_PROGRAM_PUBKEY,
  );
  return referrerATAPubkey;
}

/**
 * Links:
 * - [Jupiter Referral GitHub](https://github.com/TeamRaccoons/referral)
 * - [SDK code](https://github.com/TeamRaccoons/referral/tree/main/packages/sdk)
 * - [Program code](https://github.com/TeamRaccoons/referral/tree/main/program/programs/referral)
 * - [SDK initializeReferralTokenAccount](https://github.com/TeamRaccoons/referral/blob/1e4825087b25d59157800a571f32448e9c1e0b71/packages/sdk/src/referral.ts#L392)
 * - [IDL](https://github.com/TeamRaccoons/referral/blob/1e4825087b25d59157800a571f32448e9c1e0b71/packages/sdk/src/idl.ts#L1)
 * - [Dashboard code](https://github.com/TeamRaccoons/referral/tree/main/packages/dashboard)
 * - [InitializeReferralTokenAccount entrypoint](https://github.com/TeamRaccoons/referral/blob/1e4825087b25d59157800a571f32448e9c1e0b71/program/programs/referral/src/lib.rs#L87)
 * - [InitializeReferralTokenAccount command](https://github.com/TeamRaccoons/referral/blob/1e4825087b25d59157800a571f32448e9c1e0b71/program/programs/referral/src/instructions/initialize_referral_token_account.rs#L23)
 * - [Dashboard URL](https://referral.jup.ag/dashboard)
 *
 * Old IDL (Interface Description Language) JSON
 *
 * ```json
 *
 * {
 *   name: "initializeReferralTokenAccount",
 *   args: [],
 *   accounts: [
 *     { name: "payer"; isMut: true; isSigner: true; },
 *     { name: "project"; isMut: false; isSigner: false; },
 *     { name: "referralAccount"; isMut: false; isSigner: false; },
 *     { name: "referralTokenAccount"; isMut: true; isSigner: false; },
 *     { name: "mint"; isMut: false; isSigner: false; },
 *     { name: "systemProgram"; isMut: false; isSigner: false; },
 *     { name: "tokenProgram"; isMut: false; isSigner: false; }
 *   ],
 * }
 * ```
 */
function getJupiterInitialiseReferralTokenAccountInstruction(params: {
  /** Pubkey of the referrer program itself that instructions will be executed on */
  programId: PublicKey;
  /** Payer pubkey */
  payerPubkey: PublicKey;
  /** ? */
  vaultPubkey: PublicKey;
  /** Referrer project pubkey (your referrer address in the Jupiter console) */
  referralAccountPubkey: PublicKey;
  /** Jupiter ATA account for your referrer address with the SPL token address */
  referralATAPubkey: PublicKey;
  /** SPL token address */
  mintPubkey: PublicKey;
  /** Pubkey of the Solana SPL System Program */
  systemProgramId: PublicKey;
  /** Pubkey of the Solana SPL token program ?? TODO: WHICH ONE ?? */
  tokenProgramId: PublicKey;
}): TransactionInstruction {
  const {
    programId,
    payerPubkey,
    vaultPubkey,
    referralAccountPubkey,
    referralATAPubkey,
    mintPubkey,
    systemProgramId,
    tokenProgramId,
  } = params;

  // This is wrong:
  // const hash = createHash('sha256');
  // hash.update('initializeReferralTokenAccount');
  // const fullHash = hash.digest();
  // const discriminator = fullHash.slice(0, 8); // First 8 bytes of the hash

  // TODO: how do we calculate this? I got it from Solscan and it seems to work
  const discriminator = Buffer.from("7d12465f56b3ddbe", "hex");

  // No data is needed, only:
  //   1. The discriminator (similar to function selector in EVM)
  //   2. Keys in the correct order
  const instruction = new TransactionInstruction({
    programId,
    data: discriminator,
    keys: [
      { pubkey: payerPubkey, isSigner: true, isWritable: true },
      { pubkey: vaultPubkey, isSigner: false, isWritable: false },
      { pubkey: referralAccountPubkey, isSigner: false, isWritable: false },
      { pubkey: referralATAPubkey, isSigner: false, isWritable: true },
      { pubkey: mintPubkey, isSigner: false, isWritable: false },
      { pubkey: systemProgramId, isSigner: false, isWritable: false },
      { pubkey: tokenProgramId, isSigner: false, isWritable: false },
    ],
  });

  return instruction;
}

function sleep(
  duration: number,
  abortable?: { signal?: AbortSignal },
): Promise<void> {
  if (abortable.signal.aborted) return Promise.reject(abortable.signal.reason);
  if (duration <= 0) return Promise.resolve();
  return new Promise<void>((res, rej) => {
    function onTimeout() {
      cleanupSleep();
      res();
    }
    function onAbortDuringSleep() {
      cleanupSleep();
      rej(abortable.signal!.reason);
    }
    function cleanupSleep() {
      abortable?.signal?.removeEventListener("abort", onAbortDuringSleep);
      clearTimeout(timeout);
    }
    abortable?.signal?.addEventListener("abort", onAbortDuringSleep);
    const timeout = setTimeout(onTimeout, duration);
  });
}
