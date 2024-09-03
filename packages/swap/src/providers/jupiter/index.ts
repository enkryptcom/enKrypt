/* eslint-disable no-use-before-define, no-new, no-constant-condition, no-restricted-syntax, no-labels */

import { NetworkNames } from "@enkryptcom/types";
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  DEFAULT_SLIPPAGE,
  FEE_CONFIGS,
  NATIVE_TOKEN_ADDRESS,
} from "@src/configs";
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
} from "@src/types";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "@src/utils/approvals";
import { toBN } from "web3-utils";

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
 *
 * Jupiter requires you to create a referral account. You can do this by
 * visiting the Jupiter referral dashboard https://referral.jup.ag/dashboard
 * and selecting "create account".
 *
 * After you have a referral account (associated with your Solana address) you
 * need to create token accounts for it so that it can receive referral fees
 * for those tokens. This is also done via the Jupiter referral dashboard
 * https://referral.jup.ag/dashboard.
 *
 * ## Steps
 *
 * 1. Request a quote from the Jupiter swap API
 * 2. Request a swap transaction from the Jupiter swap API with the quote provided
 * 2.5. Modify the transaction to create the referrer ATA to receive platform fees, if required
 * 3. Deserialize and signt the transaction
 * 4. Execute the transaction
 *
 * ## Terminology
 *
 * - Mint: is the address of a token.
 * - SPL: Solana Program Library, a collection of on-chain programs that
 * - SPL Token: a token that uses the SPL program (an in-built standard Solana
 *              token program) to manage its state. Similar to an ERC20 token.
 * - ATA: Associated Token Account, an SPL token account that is associated with
 *        a Solana address. In EVM this would just be your own account.
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
 * Wrapped SOL address
 * @see https://solscan.io/token/So11111111111111111111111111111111111111112
 */
const WRAPPED_SOL_ADDRESS = "So11111111111111111111111111111111111111112";

/**
 * @see https://solscan.io/account/45ruCyfdRkWpRNGEqWzjCiXRHkZs8WXCLQ67Pnpye7Hp
 *
 * Manages referral fees
 */
const JUPITER_REFERRAL_VAULT_PUBKEY = new PublicKey(
  "45ruCyfdRkWpRNGEqWzjCiXRHkZs8WXCLQ67Pnpye7Hp"
);

/**
 * @see https://solscan.io/account/REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3
 *
 * Program targetted by instructions
 */
const JUPITER_REFERRAL_PROGRAM_PUBKEY = new PublicKey(
  "REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3"
);

/**
 * Address of the SPL Token program
 *
 * @see https://solscan.io/account/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
 */
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

/**
 * Address of the SPL Token 2022 program
 *
 * @see https://solscan.io/account/TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
 */
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

// Jupiter API Tokens

/**
 * curl -sL https://tokens.jup.ag/tokens?tags=verified | jq -C | less -N
 */
type JupiterTokenInfo = {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
};

// Jupiter API Quote

/**
 * see https://station.jup.ag/api-v 6/get-quote
 *
 * ```sh
 * curl -sL -H 'Accept: application/json' 'https://quote-api.jup.ag/v6/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=5'
 * ```
 */
type JupiterQuoteResponse = {
  /** @example "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" */
  inputMint: string;
  /** @example "5" */
  inAmount: string;
  /** @example "So11111111111111111111111111111111111111112" */
  outputMint: string;
  /** @example "35" */
  outAmount: string;
  /** @example "35" */
  otherAmountThreshold: string;
  /** @example "ExactIn" */
  swapMode: string;
  /** @example 50 */
  slippageBps: number;
  /** @example {"amount":"1","feeBps":1} */
  platformFee: null | {
    /** @example '1' */
    amount: string;
    /** @example 1 */
    feeBps: number;
  };
  /** @example "0" */
  priceImpactPct: string;
  routePlan: {
    swapInfo: {
      /** @example "5URw47pYHN9heEQFKtUFeHzTskHwN78bBvKefV5C98fe" */
      ammKey: string;
      /** @example "Oasis" */
      label: string;
      /** @example "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" */
      inputMint: string;
      /** @example "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" */
      outputMint: string;
      /** @example  "5" */
      inAmount: string;
      /** @e xample "28679" */
      outAmount: string;
      /** @exampl e "115" */
      feeAmount: string;
      /** @example "DezXAZ8z7Pn rnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" */
      feeMint: string;
    };
    /** @example 100  */
    percent: number;
  }[];
  /** @example 284606533 */
  contextSlot: number;
  /** @example 0.743937514 */
  timeTaken: number;
};

// Jupiter API Swap

/**
 * @see https://station.jup.ag/api-v6/post-swap
 *
 * HTTP request JSON body to request a Swap transaction for a given quote
 */
type JupiterSwapParams = {
  userPublicKey: string;
  /** Default: true */
  wrapAndUnwrapSol?: boolean;
  useSharedAccounts?: boolean;
  /** Referral address */
  feeAccount?: string;
  /** Public key used to track transactions */
  trackingAccount?: string;
  /** Integer */
  computeUnitPriceMicroLamports?: number;
  prioritizationFeeLamports?: number;
  /** Default: false */
  asLegacyTransaction?: boolean;
  /** Default: false */
  useTokenLedger?: boolean;
  /** Public key of key of token receiver. Default: user's ATA. */
  destinationTokenAccount?: string;
  /**
   * Simulate the swap to get the compute units (like gas in the EVM) &
   * set in ComputeBudget's compute unit limit.
   *
   * Default: false
   */
  dynamicComputeUnitLimit?: boolean;
  /** Do not do RPC calls to check on user's account. Default: false. */
  skipUserAccountRpcCalls?: boolean;
  /** Response from the Jupiter API quote endpoint */
  quoteResponse: JupiterQuoteResponse;
};

/**
 * @see https://station.jup.ag/api-v6/post-swap
 */
type JupiterSwapResponse = {
  /** Base64 encoded versioned transaction */
  swapTransaction: string;
  /** @example 265642441 */
  lastValidBlockHeight: number;
  /** @example 99999 */
  prioritizationFeeLamports?: number;
  /** @example 1400000 */
  computeUnitLimit?: number;
  prioritizationType?: {
    computeBudget?: {
      microLamports: 71428;
      estimatedMicroLamports: 142856;
    };
  };
  dynamicSlippageReport: null;
  simulationError: null;
};

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
      // TODO: handle native address
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
          isAddress: isValidSolanaAddress,
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
   * Get a quote and swap prepare a swap transactin for the assets
   */
  private async querySwapInfo(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal }
  ): Promise<{
    jupiterQuote: JupiterQuoteResponse;
    jupiterSwap: JupiterSwapResponse;
    base64SwapTransaction: string;
    feePercentage: number;
  }> {
    const feeConf = FEE_CONFIGS[this.name][meta.walletIdentifier];
    if (!feeConf)
      throw new Error("Something went wrong: no fee config for Jupiter swap");
    const referrerPubkey = new PublicKey(feeConf.referrer);
    /** Jupiter API requires an integer for bps so we must round */
    const feeBps = Math.round(100 * feeConf.fee);

    const signal = context?.signal;

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
      srcMint
    );

    const referrerATAExists = await solAccountExists(
      this.conn,
      referrerATAPubkey
    );

    const quote = await getJupiterQuote(
      {
        srcMint,
        dstMint,
        amount: BigInt(options.amount.toString(10)),
        // Integer so must round
        slippageBps: Math.round(
          100 * parseFloat(meta.slippage || DEFAULT_SLIPPAGE)
        ),
        referralFeeBps: feeBps,
      },
      { signal }
    );

    const swap = await getJupiterSwap(
      {
        quote,
        signerPubkey: new PublicKey(options.fromAddress),
        referrerATAPubkey,
      },
      { signal }
    );

    let tx = VersionedTransaction.deserialize(
      Buffer.from(swap.swapTransaction, "base64")
    );

    if (!referrerATAExists) {
      // Update the transaction so it creates a ATA account to receive referral fees in
      // see `updateSwapTransactionToCreateJupiterReferrerATA` for more details
      console.debug(
        `Referrer ATA does not exist. Updating transaction with instruction to create it. Referral ATA pubkey: ${referrerATAPubkey.toBase58()}`
      );

      const tokenProgramId = await getTokenProgramOfMint(this.conn, srcMint);

      tx = await updateSwapTransactionToCreateJupiterReferrerATA(
        this.conn,
        tx,
        {
          referrerPubkey,
          mintPubkey: srcMint,
          tokenProgramId,
          referrerATAPubkey,
          payerPubkey: new PublicKey(options.fromAddress),
        }
      );
    }

    return {
      feePercentage: feeBps / 100,
      jupiterSwap: swap,
      jupiterQuote: quote,
      base64SwapTransaction: Buffer.from(tx.serialize()).toString("base64"),
    };
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal }
  ): Promise<null | ProviderQuoteResponse> {
    const { jupiterQuote } = await this.querySwapInfo(options, meta, context);

    // Jupiter swaps have four different kinds of fees:
    // 1. Transaction base fees: number of signatures * lamports per signature
    // 2. Transaction priority fees (sometimes): set via the Compute Budget program's "SetComputeUnitPrice"
    // 3. Transaction referral fees: fees  p aid to MEW as the wa llet provider
    // 4. The swap provider, Jupiter, probably takes a fee (I think 2.5%? IIRC documented somewhere)

    const result: ProviderQuoteResponse = {
      fromTokenAmount: toBN(jupiterQuote.inAmount),
      toTokenAmount: toBN(jupiterQuote.outAmount),
      // Solana doesn't have the concept of a gas limit
      // it does have something kind-of similar to gas though, but base fees aren't changed based
      // on it, only priority fees
      // Base fees are charged on signature count (number of accounts possibly touched in transaction,
      // usually 5,000 Lamports per signature I think)
      // (unitsConsumed is kind-of like gas)
      totalGaslimit: 0,
      // TODO: consider setting this to price we pay to create the referrer ATA account if it doesn't already exist
      additionalNativeFees: toBN(0),
      provider: this.name,
      quote: {
        options,
        meta,
        provider: this.name,
      },
      minMax: {
        // TODO: how do I get these limits?
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
    context?: { signal?: AbortSignal }
  ): Promise<ProviderSwapResponse> {
    const { feePercentage, jupiterQuote, base64SwapTransaction } =
      await this.querySwapInfo(quote.options, quote.meta, context);

    const enkryptTransaction: SolanaTransaction = {
      from: quote.options.fromAddress,
      to: quote.options.toAddress,
      serialized: base64SwapTransaction,
      type: TransactionType.solana,
    };

    const result: ProviderSwapResponse = {
      transactions: [enkryptTransaction],
      fromTokenAmount: toBN(jupiterQuote.inAmount),
      toTokenAmount: toBN(jupiterQuote.outAmount),
      // TODO: consider setting this to price we pay to create the referrer ATA account if it doesn't already exist
      additionalNativeFees: toBN(0),
      provider: this.name,
      slippage: quote.meta.slippage,
      fee: feePercentage, // feeConf.fee * 100,
      getStatusObject: async (
        options: StatusOptions
      ): Promise<StatusOptionsResponse> => ({
        options,
        provider: this.name,
      }),
    };

    return result;
  }

  async getStatus(options: StatusOptions): Promise<TransactionStatus> {
    if (options.transactionHashes.length !== 1) {
      throw new TypeError(
        `JupiterSwap.getStatus: Expected one transaction hash but got ${options.transactionHashes.length}`
      );
    }
    const [txhash] = options.transactionHashes;
    const txResponse = await this.conn.getTransaction(txhash, {
      maxSupportedTransactionVersion: 0,
    });

    if (txResponse == null) {
      // Transaction hasn't been picked up by the node yet
      return TransactionStatus.pending;
    }

    if (txResponse.meta == null) {
      // TODO: verify that `ConfirmedTransactionMeta` == null means pending
      return TransactionStatus.pending;
    }

    if (txResponse.meta.err != null) {
      // TODO: verify that `err` != null means failed
      return TransactionStatus.failed;
    }

    return TransactionStatus.success;
  }
}

/**
 * Is the address a valid Solana address? (32 byte base58 string)
 *
 * @param address   hopefully 32 byte base58 string
 * @returns         true if `address` is a 32 byte base58 string
 */
function isValidSolanaAddress(address: string): Promise<boolean> {
  try {
    new PublicKey(address);
    return Promise.resolve(true);
  } catch (err) {
    return Promise.resolve(false);
  }
}

/**
 * Does the Solana account exist?
 *
 * Checks if the account has been created
 *
 * @param conn      Solana connection
 * @param address   Address to check
 * @returns         `true` if there's an account at `address`
 */
async function solAccountExists(
  conn: Connection,
  address: PublicKey
): Promise<boolean> {
  const account = await conn.getAccountInfo(address, "max");
  const exists = account != null;
  return exists;
}

/**
 * Request all verified tokens available on Jupiter swap
 *
 * (With retry, backoff, and timeouts)
 *
 * @see https://station.jup.ag/api-v6/get-quote
 */
async function getJupiterTokens(context?: {
  signal?: AbortSignal;
}): Promise<JupiterTokenInfo[]> {
  const signal = context?.signal;

  const url = JUPITER_TOKENS_URL;
  let failed = false;
  let tokens: JupiterTokenInfo[];
  const backoff = [0, 100, 500, 1000, 2_500, 5_000];
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
        `Failed to get tokens after ${backoffi} retries: ${String(
          errRef?.err ?? "???"
        )}`
      );
    }

    if (backoff[backoffi] > 0) {
      // Previous request failed, wait before retrying
      console.debug(`Retrying after ${backoff[backoffi]}ms...`);
      await new Promise<void>((res, rej) => {
        function onTimeout() {
          cleanupTimeout();
          res();
        }
        function onAbortDuringSleep() {
          cleanupTimeout();
          rej(signal!.reason);
        }
        function cleanupTimeout() {
          signal?.removeEventListener("abort", onAbortDuringSleep);
          clearTimeout(timeout);
        }
        signal?.addEventListener("abort", onAbortDuringSleep);
        const timeout = setTimeout(onTimeout);
      });
    }

    /** Cancels the HTTP request */
    const aborter = new AbortController();

    /** Cancel this request if the context cancels */
    const onAbortDuringRequest = () => {
      aborter.abort(signal!.reason);
    };

    /** Times out the request */
    const timeout = setTimeout(() => {
      aborter.abort(new Error(`HTTP request timed out ${url}`));
    }, 30_000);
    signal?.addEventListener("abort", onAbortDuringRequest);

    /** Cleanup timeouts and aborters */
    const cleanupRequest = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbortDuringRequest);
    };

    try {
      console.debug(`Initiating HTTP request for Jupiter tokens ${url}`);
      const res = await fetch(url, {
        signal: aborter.signal,
        headers: [["Accept", "application/json"]],
        redirect: "follow",
        keepalive: true,
      });
      if (!res.ok) {
        let msg = await res
          .text()
          .catch((err) => `Failed to decode response text: ${String(err)}`);
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
          `Failed to get tokens, HTTP response returned not-ok status ${
            res.status
          } ${res.statusText || "<no status text>"}: ${msg}`
        );
      }
      tokens = (await res.json()) as JupiterTokenInfo[];

      if (!tokens) {
        throw new Error(
          "Failed to get tokens: something went wrong and result is falsy"
        );
      }

      return tokens;
    } catch (err) {
      if (signal?.aborted) throw signal.reason;
      if (failed) throw err;
      console.debug(
        `Failed to get tokens on attempt ${backoffi + 1}/${
          backoff.length
        }: ${String(err)}`
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
  context?: {
    signal?: AbortSignal;
  }
): Promise<JupiterQuoteResponse> {
  const { srcMint, dstMint, amount, slippageBps, referralFeeBps } = params;

  const signal = context?.signal;

  if (slippageBps != null) {
    if (!Number.isSafeInteger(slippageBps)) {
      throw new TypeError(
        `Invalid slippageBps: ${slippageBps} must be a safe integer`
      );
    }
    if (slippageBps < 0) {
      throw new Error(`Invalid slippageBps: ${slippageBps} must be >= 0`);
    }
  }

  if (referralFeeBps != null) {
    if (!Number.isSafeInteger(referralFeeBps)) {
      throw new TypeError(
        `Invalid referralFeeBps: ${referralFeeBps} must be a safe integer`
      );
    }
    if (referralFeeBps < 0) {
      throw new TypeError(
        `Invalid referralFeeBps: ${referralFeeBps} must be >= 0`
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
  const backoff = [0, 100, 500, 1000, 2_500, 5_000];
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
        `Failed to get quote after ${backoffi} retries at url ${url}: ${String(
          errRef?.err ?? "???"
        )}`
      );
    }

    if (backoff[backoffi] > 0) {
      // Previous request failed, wait before retrying
      console.debug(`Retrying ${url} after ${backoff[backoffi]}ms...`);
      await new Promise<void>((res, rej) => {
        function onTimeout() {
          cleanupTimeout();
          res();
        }
        function onAbortDuringSleep() {
          cleanupTimeout();
          rej(signal!.reason);
        }
        function cleanupTimeout() {
          signal?.removeEventListener("abort", onAbortDuringSleep);
          clearTimeout(timeout);
        }
        signal?.addEventListener("abort", onAbortDuringSleep);
        const timeout = setTimeout(onTimeout);
      });
    }

    /** Cancels the HTTP request */
    const aborter = new AbortController();

    /** Cancel this request if the context cancels */
    const onAbortDuringRequest = () => {
      aborter.abort(signal!.reason);
    };

    /** Times out the request */
    const timeout = setTimeout(() => {
      aborter.abort(new Error(`HTTP request timed out ${url}`));
    }, 30_000);
    signal?.addEventListener("abort", onAbortDuringRequest);

    /** Cleanup timeouts and aborters */
    const cleanupRequest = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbortDuringRequest);
    };

    try {
      console.debug(`Initiating HTTP request for Jupiter quote ${url}`);
      const res = await fetch(url, {
        signal: aborter.signal,
        headers: [["Accept", "application/json"]],
        redirect: "follow",
        keepalive: true,
      });
      if (!res.ok) {
        let msg = await res
          .text()
          .catch((err) => `Failed to decode response text: ${String(err)}`);
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
          `Failed to get quote, HTTP response returned not-ok status ${
            res.status
          } ${res.statusText || "<no status text>"} at url ${url}: ${msg}`
        );
      }
      quote = (await res.json()) as JupiterQuoteResponse;

      if (!quote) {
        throw new Error(
          `Failed to get quote at url ${url}, something went wrong and result is falsy`
        );
      }

      return quote;
    } catch (err) {
      if (signal?.aborted) throw signal.reason;
      if (failed) throw err;
      console.warn(
        `Failed to get quote on attempt ${backoffi + 1}/${
          backoff.length
        }: ${String(err)}`
      );
      errRef ??= { err: err as Error };
    } finally {
      cleanupRequest();
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
    /** Base58 referrer address (created in the Jupiter dashboard, not the ATA address) */
    referrerATAPubkey?: PublicKey;
    /** Response from Jupiter API */
    quote: JupiterQuoteResponse;
  },
  context?: {
    signal?: AbortSignal;
  }
): Promise<JupiterSwapResponse> {
  const { signerPubkey, quote, referrerATAPubkey } = params;
  const signal = context?.signal;

  const swapParams: JupiterSwapParams = {
    userPublicKey: signerPubkey.toBase58(),
    feeAccount: referrerATAPubkey?.toBase58() ?? undefined,
    quoteResponse: quote,
  };

  const url = `${JUPITER_API_URL}swap`;
  let failed = false;
  let swap: JupiterSwapResponse;
  const backoff = [0, 100, 500, 1000, 2_500, 5_000];
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
        `Failed to get swap after ${backoffi} retries at url ${url}: ${String(
          errRef?.err ?? "???"
        )}`
      );
    }

    if (backoff[backoffi] > 0) {
      // Previous request failed, wait before retrying
      console.debug(`Retrying ${url} after ${backoff[backoffi]}ms...`);
      await new Promise<void>((res, rej) => {
        function onTimeout() {
          cleanupTimeout();
          res();
        }
        function onAbortDuringSleep() {
          cleanupTimeout();
          rej(signal!.reason);
        }
        function cleanupTimeout() {
          signal?.removeEventListener("abort", onAbortDuringSleep);
          clearTimeout(timeout);
        }
        signal?.addEventListener("abort", onAbortDuringSleep);
        const timeout = setTimeout(onTimeout);
      });
    }

    /** Cancels the HTTP request */
    const aborter = new AbortController();

    /** Cancel this request if the context cancels */
    const onAbortDuringRequest = () => {
      aborter.abort(signal!.reason);
    };

    /** Times out the request */
    const timeout = setTimeout(() => {
      aborter.abort(new Error(`HTTP request timed out ${url}`));
    }, 30_000);
    signal?.addEventListener("abort", onAbortDuringRequest);

    /** Cleanup timeouts and aborters */
    const cleanupRequest = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbortDuringRequest);
    };

    try {
      console.debug(`Initiating HTTP request for Jupiter swap ${url}`);
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
          .catch((err) => `Failed to decode response text: ${String(err)}`);
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
          `Failed to get swap, HTTP response returned not-ok status ${
            res.status
          } ${res.statusText || "<no status text>"} at url ${url}: ${msg}`
        );
      }

      swap = (await res.json()) as JupiterSwapResponse;

      if (!quote) {
        throw new Error(
          `Failed to get swap at url ${url}, something went wrong and result is falsy`
        );
      }

      return swap;
    } catch (err) {
      if (failed) throw err;
      console.debug(
        `Failed to get swap on attempt ${backoffi + 1}/${
          backoff.length
        }: ${String(err)}`
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
  mintPubkey: PublicKey
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
    JUPITER_REFERRAL_PROGRAM_PUBKEY
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
 *     { name: "payer"; isMut: true; isSigner: true; *     },
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

/**
 * Modify the transaction received from the Jupiter swap API to also create the
 * Jupiter referrer ATA account so that we can receive referral fees in it
 */
async function updateSwapTransactionToCreateJupiterReferrerATA(
  conn: Connection,
  /** Transaction direectly from Jupiter Swap */
  tx: VersionedTransaction,
  params: {
    /** Pubkey paying for the transaction */
    payerPubkey: PublicKey;
    /** Pubkey of your Jupiter referral account, from the Jupiter dashboard */
    referrerPubkey: PublicKey;
    /** Jupiter referrer ATA pubkey @see `getJupiterReferrerAssociatedTokenAccount` */
    referrerATAPubkey: PublicKey;
    /** SPL token address */
    mintPubkey: PublicKey;
    /** The SPL token progam or the 2022 SPL token program */
    tokenProgramId: PublicKey;
  }
) {
  const {
    payerPubkey,
    referrerPubkey,
    referrerATAPubkey,
    mintPubkey,
    tokenProgramId,
  } = params;

  // Get the instruction that creates the Jupiter referral ATA account
  const instruction = getJupiterInitialiseReferralTokenAccountInstruction({
    payerPubkey,
    programId: JUPITER_REFERRAL_PROGRAM_PUBKEY,
    vaultPubkey: JUPITER_REFERRAL_VAULT_PUBKEY,
    referralAccountPubkey: referrerPubkey,
    referralATAPubkey: referrerATAPubkey,
    mintPubkey,
    systemProgramId: SystemProgram.programId,
    tokenProgramId,
  });

  // Now we need to:
  // 1. Decompile the transaction
  // 2. Put our instruction in it
  // 3. Recompile it

  // Request lookup accounts so that we can decompile the message
  //
  // Lookup accounts store arrays of addresses. These accounts let compiled transaction messages reference indexes
  // in the lookup account rather than by the pubkey, saving lots of space (~4 byte integer index vs 32 byte pubkey).
  //
  // To decompile a message we first need all the lookup accounts that it includes so that we can get the
  // the addresses that our message needs.
  //
  // We can also use the lookup accounts when re-compiling the transaction.
  const lookupAccountsCount = tx.message.addressTableLookups.length;
  const addressLookupTableAccounts: AddressLookupTableAccount[] = new Array(
    lookupAccountsCount
  );
  for (let i = 0; i < lookupAccountsCount; i++) {
    const lookup = tx.message.addressTableLookups[i];
    const result = await conn.getAddressLookupTable(lookup.accountKey);
    const addressLookupTableAccount = result.value;
    if (addressLookupTableAccount == null)
      throw new Error(
        `Failed to get address lookup table for ${lookup.accountKey}`
      );
    console.debug(
      `Fetching lookup account ${i + 1}. ${lookup.accountKey.toBase58()}`
    );
    addressLookupTableAccounts[i] = addressLookupTableAccount;
  }

  // Decompile the transaction message so we can modify it
  const decompiledTransactionMessage = TransactionMessage.decompile(
    tx.message,
    { addressLookupTableAccounts }
  );

  // Insert our instruction to create an account directly after compute budget
  // program instructions that compute limits and priority fees
  const computeBudgetProgramAddr = ComputeBudgetProgram.programId.toBase58();
  let inserted = false;
  instructionLoop: for (
    let i = 0, len = decompiledTransactionMessage.instructions.length;
    i < len;
    i++
  ) {
    // As soon as we hit a non compute budget program, insert our instruction to create the account
    const existingInstruction = decompiledTransactionMessage.instructions[i];
    switch (existingInstruction.programId.toBase58()) {
      case computeBudgetProgramAddr:
        // do nothing
        break;
      default: {
        // insert our instruction here & continue
        console.debug(
          `Inserting instruction to create an ATA account for Jupiter referrer with mint at instruction index ${i}`
        );
        inserted = true;
        decompiledTransactionMessage.instructions.splice(i, 0, instruction);
        break instructionLoop;
      }
    }
  }

  if (!inserted) {
    // If there were no compute budget instructions then just add it at the start
    console.debug(
      `Inserting instruction to create an ATA account for Jupiter referrer with mint at start of instructions`
    );
    decompiledTransactionMessage.instructions.unshift(instruction);
  }

  // Switch to using this modified transaction
  console.debug(`Re-compiling transaction`);
  const modifiedTx = new VersionedTransaction(
    decompiledTransactionMessage.compileToV0Message(addressLookupTableAccounts)
  );

  return modifiedTx;
}

/**
 * Get the SPL token program that owns (/created) the given mint (token). Either the SPL token program
 * or the 2022 SPL token program
 *
 * @returns   Pubkey of the SPL token token owner program
 * @throws    If the account does not exist or if it's not owned by one of the SPL token programs
 */
async function getTokenProgramOfMint(
  conn: Connection,
  mint: PublicKey
): Promise<PublicKey> {
  console.debug(`Checking mint account of ${mint.toBase58()}`);
  const srcMintAcc = await conn.getAccountInfo(mint);

  if (srcMintAcc == null) {
    throw new Error(
      `There is no SPL token account at address ${mint.toBase58()}`
    );
  }

  switch (srcMintAcc.owner.toBase58()) {
    case TOKEN_PROGRAM_ID.toBase58():
    case TOKEN_2022_PROGRAM_ID.toBase58():
      return srcMintAcc.owner;
    default:
      throw new Error(
        `Mint address is not a valid SPL token, must either have owner` +
          ` TOKEN_PROGRAM_ID (${TOKEN_PROGRAM_ID.toBase58()})` +
          ` or TOKEN_2022_PROGRAM_ID (${TOKEN_2022_PROGRAM_ID.toBase58()})`
      );
  }
}