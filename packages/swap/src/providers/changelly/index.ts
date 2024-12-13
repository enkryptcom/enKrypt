import type Web3Eth from "web3-eth";
import { v4 as uuidv4 } from "uuid";
import { DebugLogger, fromBase, toBase } from "@enkryptcom/utils";
import { numberToHex, toBN } from "web3-utils";
import {
  VersionedTransaction,
  SystemProgram,
  PublicKey,
  TransactionMessage,
  Connection,
  TransactionInstruction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction as createSPLTransferInstruction,
} from "@solana/spl-token";
import {
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
  SwapTransaction,
  TokenType,
  TokenTypeTo,
  TransactionStatus,
  TransactionType,
} from "../../types";
import {
  CHANGELLY_LIST,
  DEFAULT_SLIPPAGE,
  GAS_LIMITS,
  NATIVE_TOKEN_ADDRESS,
} from "../../configs";

import { getTransfer } from "../../utils/approvals";
import supportedNetworks, { supportedNetworksSet } from "./supported";
import {
  ChangellyApiCreateFixedRateTransactionParams,
  ChangellyApiCreateFixedRateTransactionResult,
  ChangellyApiGetFixRateForAmountParams,
  ChangellyApiGetFixRateForAmountResult,
  ChangellyApiGetFixRateParams,
  ChangellyApiGetFixRateResult,
  ChangellyApiGetStatusParams,
  ChangellyApiGetStatusResult,
  ChangellyApiResponse,
  ChangellyApiValidateAddressParams,
  ChangellyApiValidateAddressResult,
  ChangellyCurrency,
} from "./types";
import estimateEVMGasList from "../../common/estimateGasList";
import {
  getCreateAssociatedTokenAccountIdempotentInstruction,
  getSPLAssociatedTokenAccountPubkey,
  getTokenProgramOfMint,
  solAccountExists,
  SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
} from "../../utils/solana";

const logger = new DebugLogger("swap:changelly");

const BASE_URL = "https://partners.mewapi.io/changelly-v2";

class Changelly extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  web3: Web3Eth | Connection;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  /** Dynamically generated Changelly swap token data from the Enkrypt dynamic-lists repo {@link CHANGELLY_LIST} */
  changellyList: ChangellyCurrency[];

  contractToTicker: Record<string, string>;

  constructor(web3: Web3Eth | Connection, network: SupportedNetworkName) {
    super();
    this.web3 = web3;
    this.network = network;
    this.tokenList = [];
    this.name = ProviderName.changelly;
    this.fromTokens = {};
    this.toTokens = {};
    this.contractToTicker = {};
  }

  async init(): Promise<void> {
    logger.info("init: Initialising...");

    if (!Changelly.isSupported(this.network)) {
      logger.info(
        `init: Enkrypt does not support Changelly on this network  network=${this.network}`,
      );
      return;
    }
    this.changellyList = await fetch(CHANGELLY_LIST).then((res) => res.json());

    /** Changelly blockchain name -> enkrypt supported swap network name */
    const changellyToNetwork: Record<string, SupportedNetworkName> = {};
    // Generate mapping of changelly blockchain -> enkrypt blockchain
    Object.keys(supportedNetworks).forEach((net) => {
      changellyToNetwork[supportedNetworks[net].changellyName] =
        net as unknown as SupportedNetworkName;
    });

    /** List of changelly blockchain names */
    const supportedChangellyNames = new Set(
      Object.values(supportedNetworks).map((s) => s.changellyName),
    );

    this.changellyList.forEach((cur) => {
      // Must be a supported token
      if (!supportedChangellyNames.has(cur.blockchain)) {
        return;
      }

      if (
        cur.enabledFrom &&
        cur.fixRateEnabled &&
        cur.token &&
        changellyToNetwork[cur.blockchain] === this.network
      ) {
        this.fromTokens[cur.token.address] = cur.token;
      }

      // Can currency can be swapped to?
      if (cur.enabledTo && cur.fixRateEnabled && cur.token) {
        if (!this.toTokens[changellyToNetwork[cur.blockchain]])
          this.toTokens[changellyToNetwork[cur.blockchain]] = {};
        this.toTokens[changellyToNetwork[cur.blockchain]][cur.token.address] = {
          ...cur.token,
          networkInfo: {
            name: changellyToNetwork[cur.blockchain] as SupportedNetworkName,
            isAddress: supportedNetworks[changellyToNetwork[cur.blockchain]]
              .isAddress
              ? supportedNetworks[changellyToNetwork[cur.blockchain]].isAddress
              : (address: string) => this.isValidAddress(address, cur.ticker),
          },
        };
      }

      if (cur.token)
        this.setTicker(
          cur.token,
          changellyToNetwork[cur.blockchain],
          cur.ticker,
        );
    });

    logger.info(
      `init: Finished initialising  this.changellyList.length=${this.changellyList.length}`,
    );
  }

  private setTicker(
    token: TokenType,
    network: SupportedNetworkName,
    ticker: string,
  ) {
    this.contractToTicker[`${network}-${token.address}`] = ticker;
  }

  private getTicker(token: TokenType, network: SupportedNetworkName) {
    return this.contractToTicker[`${network}-${token.address}`];
  }

  static isSupported(network: SupportedNetworkName) {
    return supportedNetworksSet.has(network);
  }

  /**
   * Make a HTTP request to the Changelly Json RPC API
   *
   * @param method  JsonRPC request method
   * @param params  JsonRPC request parameters
   * @param context Cancellable execution context
   * @returns       JsonRPC response, could be success or error
   */
  private async changellyRequest<T>(
    method: string,
    params: any,
    context?: { signal?: AbortSignal },
  ): Promise<ChangellyApiResponse<T>> {
    const signal = context?.signal;
    const aborter = new AbortController();
    function onAbort() {
      // Pass context signal to the request signal
      aborter.abort(signal!.reason);
    }
    function onTimeout() {
      aborter.abort(
        new Error(`Changelly API request timed out ${BASE_URL} ${method}`),
      );
    }
    function cleanup() {
      // eslint-disable-next-line no-use-before-define
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
    }
    const timeout = setTimeout(onTimeout, 30_000);
    signal?.addEventListener("abort", onAbort);
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        signal: aborter.signal,
        body: JSON.stringify({
          id: uuidv4(),
          jsonrpc: "2.0",
          method,
          params,
        }),
        headers: [
          ["Content-Type", "application/json"],
          ["Accept", "application/json"],
        ],
      });
      const json = (await response.json()) as ChangellyApiResponse<T>;
      return json;
    } finally {
      cleanup();
    }
  }

  async isValidAddress(address: string, ticker: string): Promise<boolean> {
    const params: ChangellyApiValidateAddressParams = {
      currency: ticker,
      address,
    };

    /** @see https://docs.changelly.com/validate-address */
    const response =
      await this.changellyRequest<ChangellyApiValidateAddressResult>(
        "validateAddress",
        params,
      );

    if (response.error) {
      console.warn(
        `Error validating address with via Changelly` +
          `  code=${String(response.error.code)}` +
          `  message=${String(response.error.message)}`,
      );
      return false;
    }

    if (typeof response.result.result !== "boolean") {
      console.warn(
        'Unexpected response to "validateAddress" call to Changelly.' +
          ` Expected a response.result.result to be a boolean` +
          ` but received response: ${JSON.stringify(response)}`,
      );
      return false;
    }

    const isValid = response.result.result;
    logger.info(
      `isValidAddress: Changelly validateAddress result` +
        `  address=${address}` +
        `  ticker=${ticker}` +
        `  isValid=${isValid}`,
    );
    return isValid;
  }

  getFromTokens() {
    return this.fromTokens;
  }

  getToTokens() {
    if (Object.keys(this.fromTokens).length) return this.toTokens;
    return {};
  }

  async getMinMaxAmount(
    options: { fromToken: TokenType; toToken: TokenTypeTo },
    context?: { signal?: AbortSignal },
  ): Promise<MinMaxResponse> {
    const { fromToken, toToken } = options;
    const signal = context?.signal;

    const startedAt = Date.now();
    const emptyResponse = {
      minimumFrom: toBN("0"),
      maximumFrom: toBN("0"),
      minimumTo: toBN("0"),
      maximumTo: toBN("0"),
    };

    try {
      const params: ChangellyApiGetFixRateParams = {
        from: this.getTicker(fromToken, this.network),
        to: this.getTicker(
          toToken as TokenType,
          toToken.networkInfo.name as SupportedNetworkName,
        ),
      };

      const response =
        await this.changellyRequest<ChangellyApiGetFixRateResult>(
          "getFixRate",
          params,
          { signal },
        );

      if (response.error) {
        // JsonRPC ERR response
        console.warn(
          `Changelly "getFixRate" returned JSONRPC error response` +
            `  fromToken=${fromToken.symbol} (${params.from})` +
            `  toToken=${toToken.symbol} (${params.to})` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
            `  code=${String(response.error.code)}` +
            `  message=${String(response.error.message)}`,
        );
        return emptyResponse;
      }

      // JsonRPC OK response
      const result = response.result[0];
      const minMax = {
        minimumFrom: toBN(toBase(result.minFrom, fromToken.decimals)),
        maximumFrom: toBN(toBase(result.maxFrom, fromToken.decimals)),
        minimumTo: toBN(toBase(result.minTo, toToken.decimals)),
        maximumTo: toBN(toBase(result.maxTo, toToken.decimals)),
      };
      logger.info(
        `getMinMaxAmount: Successfully got min and max of swap pair` +
          `  fromToken=${fromToken.symbol} (${params.from})` +
          `  toToken=${toToken.symbol} (${params.to})` +
          `  took=${(Date.now() - startedAt).toLocaleString()}ms`,
      );
      return minMax;
    } catch (err) {
      // HTTP request failed
      console.warn(
        `Errored calling Changelly JSONRPC HTTP API "getFixRate"` +
          `  fromToken=${fromToken.symbol}` +
          `  toToken=${toToken.symbol}` +
          `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
          `  err=${String(err)}`,
      );
      return emptyResponse;
    }
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderQuoteResponse | null> {
    const signal = context?.signal;

    const startedAt = Date.now();

    logger.info(
      `getQuote: Getting Changelly quote` +
        `  srcToken=${options.fromToken.symbol}` +
        `  dstToken=${options.toToken.symbol}` +
        `  fromAddress=${options.fromAddress}` +
        `  toAddress=${options.toAddress}` +
        `  fromNetwork=${this.network}` +
        `  toNetwork=${options.toToken.networkInfo.name}`,
    );

    if (
      !Changelly.isSupported(
        options.toToken.networkInfo.name as SupportedNetworkName,
      )
    ) {
      logger.info(
        `getQuote: No swap: Enkrypt does not support Changelly on the destination network` +
          `  dstNetwork=${options.toToken.networkInfo.name}`,
      );
      return null;
    }

    if (!Changelly.isSupported(this.network)) {
      logger.info(
        `getQuote: No swap: Enkrypt does not support Changelly on the source network` +
          `  srcNetwork=${this.network}`,
      );
      return null;
    }

    if (!this.getTicker(options.fromToken, this.network)) {
      logger.info(
        `getQuote: No swap: Failed to find ticker for src token` +
          `  srcToken=${options.fromToken.symbol}` +
          `  srcNetwork=${this.network}`,
      );
      return null;
    }

    if (
      !this.getTicker(
        options.toToken as TokenType,
        options.toToken.networkInfo.name as SupportedNetworkName,
      )
    ) {
      logger.info(
        `getQuote: No swap: Failed to find ticker for dst token` +
          `  dstToken=${options.toToken.symbol}` +
          `  dstNetwork=${options.toToken.networkInfo.name}`,
      );
      return null;
    }

    const minMax = await this.getMinMaxAmount({
      fromToken: options.fromToken,
      toToken: options.toToken,
    });

    let quoteRequestAmount = options.amount;

    // Clamp `quoteRequestAmount`
    if (quoteRequestAmount.lt(minMax.minimumFrom))
      quoteRequestAmount = minMax.minimumFrom;
    else if (quoteRequestAmount.gt(minMax.maximumFrom))
      quoteRequestAmount = minMax.maximumFrom;

    if (quoteRequestAmount.toString() === "0") {
      logger.info(
        `getQuote: No swap: Quote request amount is zero` +
          `  fromToken=${options.fromToken.symbol}` +
          `  toToken=${options.toToken.symbol}` +
          `  minimumFrom=${minMax.minimumFrom.toString()}` +
          `  maximumFrom=${minMax.maximumFrom.toString()}`,
      );
      return null;
    }

    logger.info(`getQuote: Requesting changelly swap...`);

    try {
      const params: ChangellyApiGetFixRateForAmountParams = {
        from: this.getTicker(options.fromToken, this.network),
        to: this.getTicker(
          options.toToken as TokenType,
          options.toToken.networkInfo.name as SupportedNetworkName,
        ),
        amountFrom: fromBase(
          quoteRequestAmount.toString(),
          options.fromToken.decimals,
        ),
      };

      const response =
        await this.changellyRequest<ChangellyApiGetFixRateForAmountResult>(
          "getFixRateForAmount",
          params,
          { signal },
        );

      logger.info(`getQuote: Received Changelly swap response`);

      if (response.error) {
        console.warn(
          `Changelly "getFixRateForAmount" returned JSONRPC error response,` +
            ` returning no quotes` +
            `  fromToken=${options.fromToken.symbol} (${params.from})` +
            `  toToken=${options.toToken.symbol} (${params.to})` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
            `  code=${String(response.error.code)}` +
            `  message=${String(response.error.message)}`,
        );
        return null;
      }

      if (!response.result || !response.result[0]?.id) {
        console.warn(
          `Changelly "getFixRateForAmount" response contains no quotes,` +
            ` returning no quotes` +
            `  fromToken=${options.fromToken.symbol} (${params.from})` +
            `  toToken=${options.toToken.symbol} (${params.to})` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
            `  code=${String(response.error.code)}` +
            `  message=${String(response.error.message)}`,
        );
        return null;
      }

      // TODO: Do we want to warn here? or just debug log? or nothing?
      if (response.result.length > 1) {
        console.warn(
          `Changelly "getFixRateForAmount" returned more than one quote, continuing with first quote` +
            `  fromToken=${options.fromToken.symbol} (${params.from})` +
            `  toToken=${options.toToken.symbol} (${params.to})` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
            `  count=${response.result.length}ms`,
        );
      }

      const [firstChangellyFixRateQuote] = response.result;

      const evmGasLimit =
        options.fromToken.address === NATIVE_TOKEN_ADDRESS &&
        options.fromToken.type === NetworkType.EVM
          ? 21000
          : toBN(GAS_LIMITS.transferToken).toNumber();

      // `toBase` fails sometimes because Changelly returns more decimals than the token has
      let toTokenAmountBase: string;
      try {
        toTokenAmountBase = toBase(
          firstChangellyFixRateQuote.amountTo,
          options.toToken.decimals,
        );
      } catch (err) {
        console.warn(
          `Changelly "getFixRateForAmount" "amountTo" possibly returned more` +
            ` decimals than the token has, attempting to trim trailing decimals...` +
            `  amountTo=${firstChangellyFixRateQuote.amountTo}` +
            `  toTokenDecimals=${options.toToken.decimals}` +
            `  err=${String(err)}`,
        );
        const original = firstChangellyFixRateQuote.amountTo;
        // eslint-disable-next-line no-use-before-define
        const [success, fixed] = fixBaseAndTrimDecimals(
          original,
          options.toToken.decimals,
        );
        if (!success) throw err;
        const rounded = (BigInt(fixed) - BigInt(1)).toString();
        toTokenAmountBase = rounded;

        logger.info(
          `getQuote: Fixed amountTo` +
            `  firstChangellyFixRateQuote.amountTo=${firstChangellyFixRateQuote.amountTo}` +
            `  toTokenAmountBase=${toTokenAmountBase}` +
            `  options.toToken.decimals=${options.toToken.decimals}` +
            `  options.toToken.symbol=${options.toToken.symbol}` +
            `  options.toToken.name=${options.toToken.name}` +
            `  options.toToken.address=${options.toToken.address}`,
        );
      }

      // `toBase` fails sometimes because Changelly returns more decimals than the token has
      let networkFeeBase: string;
      try {
        networkFeeBase = toBase(
          firstChangellyFixRateQuote.networkFee,
          options.toToken.decimals,
        );
      } catch (err) {
        console.warn(
          `Changelly "getFixRateForAmount" "networkFee" possibly returned more` +
            ` decimals than the token has, attempting to trim trailing decimals...` +
            `  networkFee=${firstChangellyFixRateQuote.networkFee}` +
            `  toTokenDecimals=${options.toToken.decimals}` +
            `  err=${String(err)}`,
        );
        const original = firstChangellyFixRateQuote.networkFee;
        // eslint-disable-next-line no-use-before-define
        const [success, fixed] = fixBaseAndTrimDecimals(
          original,
          options.toToken.decimals,
        );
        if (!success) throw err;
        const rounded = (BigInt(fixed) + BigInt(1)).toString();
        networkFeeBase = rounded;

        logger.info(
          `getQuote: Fixed networkFee` +
            `  firstChangellyFixRateQuote.networkFee=${firstChangellyFixRateQuote.networkFee}` +
            `  networkFeeBase=${networkFeeBase}` +
            `  options.toToken.decimals=${options.toToken.decimals}` +
            `  options.toToken.symbol=${options.toToken.symbol}` +
            `  options.toToken.name=${options.toToken.name}` +
            `  options.toToken.address=${options.toToken.address}`,
        );
      }
      const providerQuoteResponse: ProviderQuoteResponse = {
        fromTokenAmount: quoteRequestAmount,
        additionalNativeFees: toBN(0),
        toTokenAmount: toBN(toTokenAmountBase).sub(toBN(networkFeeBase)),
        provider: this.name,
        quote: {
          meta: {
            ...meta,
            changellyQuoteId: firstChangellyFixRateQuote.id,
            changellynetworkFee: toBN(networkFeeBase),
          },
          options: {
            ...options,
            amount: quoteRequestAmount,
          },
          provider: this.name,
        },
        totalGaslimit:
          options.fromToken.type === NetworkType.EVM ? evmGasLimit : 0,
        minMax,
      };

      logger.info(
        `getQuote: Successfully retrieved quote from Changelly via "getFixRateForAmount"` +
          `  took=${(Date.now() - startedAt).toLocaleString()}ms`,
      );

      return providerQuoteResponse;
    } catch (err) {
      console.warn(
        `Errored getting quotes from Changelly via "getFixRateForAmount",` +
          ` returning no quotes` +
          `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
          `  err=${String(err)}`,
      );
      return null;
    }
  }

  async getSwap(
    quote: SwapQuote,
    context?: { signal?: AbortSignal },
  ): Promise<ProviderSwapResponse | null> {
    const signal = context?.signal;

    const startedAt = Date.now();
    logger.info(`getSwap: Requesting swap transaction from Changelly...`);

    if (!Changelly.isSupported(this.network)) {
      logger.info(
        `getSwap: Enkrypt does not support Changelly on the source network, returning no swap` +
          `  srcNetwork=${this.network}`,
      );
      return null;
    }

    if (
      !Changelly.isSupported(
        quote.options.toToken.networkInfo.name as SupportedNetworkName,
      )
    ) {
      logger.info(
        `getSwap: Enkrypt does not support Changelly on the destination network, returning no swap` +
          `  dstNetwork=${quote.options.toToken.networkInfo.name}`,
      );
      return null;
    }

    try {
      const params: ChangellyApiCreateFixedRateTransactionParams = {
        from: this.getTicker(quote.options.fromToken, this.network),
        to: this.getTicker(
          quote.options.toToken as TokenType,
          quote.options.toToken.networkInfo.name as SupportedNetworkName,
        ),
        refundAddress: quote.options.fromAddress,
        address: quote.options.toAddress,
        amountFrom: fromBase(
          quote.options.amount.toString(),
          quote.options.fromToken.decimals,
        ),
        rateId: quote.meta.changellyQuoteId,
      };

      const response =
        await this.changellyRequest<ChangellyApiCreateFixedRateTransactionResult>(
          "createFixTransaction",
          params,
          { signal },
        );

      if (response.error) {
        console.warn(
          `Changelly "createFixTransaction" returned JSONRPC error response, returning no swap` +
            `  fromToken=${quote.options.fromToken.symbol} (${params.from})` +
            `  toToken=${quote.options.toToken.symbol} (${params.to})` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
            `  code=${String(response.error.code)}` +
            `  message=${String(response.error.message)}`,
        );
        return null;
      }

      if (!response.result.id) {
        console.warn(
          `Changelly "createFixTransaction" response contains no id, returning no swap` +
            `  fromToken=${quote.options.fromToken.symbol} (${params.from})` +
            `  toToken=${quote.options.toToken.symbol} (${params.to})` +
            `  took=${(Date.now() - startedAt).toLocaleString()}ms`,
        );
        return null;
      }

      let additionalNativeFees = toBN(0);
      const changellyFixedRateTx = response.result;
      let transaction: SwapTransaction;
      switch (quote.options.fromToken.type) {
        case NetworkType.EVM: {
          logger.info(`getSwap: Preparing EVM transaction for Changelly swap`);
          if (quote.options.fromToken.address === NATIVE_TOKEN_ADDRESS) {
            transaction = {
              from: quote.options.fromAddress,
              data: "0x",
              gasLimit: numberToHex(21000),
              to: changellyFixedRateTx.payinAddress,
              value: numberToHex(quote.options.amount),
              type: TransactionType.evm,
            };
          } else {
            transaction = getTransfer({
              from: quote.options.fromAddress,
              contract: quote.options.fromToken.address,
              to: changellyFixedRateTx.payinAddress,
              value: quote.options.amount.toString(),
            });
          }
          const accurateGasEstimate = await estimateEVMGasList(
            [transaction],
            this.network,
          );
          if (accurateGasEstimate) {
            if (accurateGasEstimate.isError) return null;
            const [txGaslimit] = accurateGasEstimate.result;
            transaction.gasLimit = txGaslimit;
          }
          break;
        }
        case NetworkType.Solana: {
          logger.info(
            `getSwap: Changelly is not supported on Solana at this time`,
          );

          const conn = this.web3 as Connection;

          const latestBlockHash = await conn.getLatestBlockhash();

          // Create a transaction to transfer this much of that token to that thing
          let versionedTx: VersionedTransaction;
          if (quote.options.fromToken.address === NATIVE_TOKEN_ADDRESS) {
            // Swapping from native SOL

            logger.info(
              `getSwap: Preparing Solana Changelly SOL swap transaction` +
                `  quote.options.fromAddress=${quote.options.fromAddress}` +
                `  latestBlockHash=${latestBlockHash.blockhash}` +
                `  lastValidBlockHeight=${latestBlockHash.lastValidBlockHeight}` +
                `  payinAddress=${changellyFixedRateTx.payinAddress}` +
                `  lamports=${BigInt(quote.options.amount.toString())}`,
            );
            versionedTx = new VersionedTransaction(
              new TransactionMessage({
                payerKey: new PublicKey(quote.options.fromAddress),
                recentBlockhash: latestBlockHash.blockhash,
                instructions: [
                  SystemProgram.transfer({
                    fromPubkey: new PublicKey(quote.options.fromAddress),
                    toPubkey: new PublicKey(changellyFixedRateTx.payinAddress),
                    lamports: BigInt(quote.options.amount.toString()),
                  }),
                ],
              }).compileToV0Message(),
            );
          } else {
            // Swapping from a token on SOL

            // We need to send our src tokens to the payin address
            // for Changelly to begin the cross-chain swap
            // But first we'll need to create the src mint ATA for the payin address
            // so it can receive the tokens
            const mint = new PublicKey(quote.options.fromToken.address);
            const tokenProgramId = await getTokenProgramOfMint(conn, mint);
            const wallet = new PublicKey(quote.options.fromAddress);
            const walletAta = getSPLAssociatedTokenAccountPubkey(
              wallet,
              mint,
              tokenProgramId,
            );
            const payin = new PublicKey(changellyFixedRateTx.payinAddress);
            const payinAta = getSPLAssociatedTokenAccountPubkey(
              payin,
              mint,
              tokenProgramId,
            );
            const amount = BigInt(quote.options.amount.toString());
            logger.info(
              `getSwap: Preparing Solana Changelly SPL token swap transaction` +
                `  srcMint=${mint.toBase58()}` +
                `  srcTokenProgramId=${tokenProgramId.toBase58()}` +
                `  wallet=${wallet.toBase58()}` +
                `  walletAta=${tokenProgramId.toBase58()}` +
                `  payin=${payin.toBase58()}` +
                `  payinAta=${payinAta.toBase58()}` +
                `  latestBlockHash=${latestBlockHash.blockhash}` +
                `  lastValidBlockHeight=${latestBlockHash.lastValidBlockHeight}` +
                `  amount=${amount}`,
            );

            // If the ATA account doesn't exist we need create it
            const payinAtaExists = await solAccountExists(conn, payinAta);

            // We probably need to set some priority fees? IDK...

            const instructions: TransactionInstruction[] = [];
            if (payinAtaExists) {
              logger.info(
                `getSwap: Payin ATA already exists. No need to create it.`,
              );
            } else {
              logger.info(
                `getSwap: Payin ATA does not exist. Need to create it.`,
              );
              const extraRentFee = await conn.getMinimumBalanceForRentExemption(
                SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES,
              );
              const instruction =
                getCreateAssociatedTokenAccountIdempotentInstruction({
                  payerPubkey: wallet,
                  ataPubkey: payinAta,
                  ownerPubkey: payin,
                  mintPubkey: mint,
                  systemProgramId: SystemProgram.programId,
                  tokenProgramId,
                  associatedTokenProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
                });

              instructions.push(instruction);
              additionalNativeFees = additionalNativeFees.add(
                toBN(extraRentFee),
              );
            }

            /** Priority fee (units: micro lamports per compute unit) in recent transactions */
            const recentFees = await conn.getRecentPrioritizationFees();
            // Sort by fee amount ascending so we can get the median
            recentFees.sort(
              (a, b) => a.prioritizationFee - b.prioritizationFee,
            );
            const recentFeeCount = recentFees.length;
            let recentFeeCountWithoutZeroes = 0;
            let recentFeeMin = 0;
            let recentFeeMax = 0;
            let recentFeeSum = 0;
            let recentFeeMedian = 0;
            const recentFeeMediani = Math.floor(recentFeeCount / 2);
            // Use the minimum of the mean average and median average as our priority fee
            for (
              let recentFeei = 0;
              recentFeei < recentFeeCount;
              recentFeei++
            ) {
              const { prioritizationFee } = recentFees[recentFeei];
              recentFeeSum += prioritizationFee;
              if (recentFeei === recentFeeMediani)
                recentFeeMedian = prioritizationFee;
              if (prioritizationFee > 0) recentFeeCountWithoutZeroes++;
              if (prioritizationFee < recentFeeMin)
                recentFeeMin = prioritizationFee;
              if (prioritizationFee > recentFeeMax)
                recentFeeMax = prioritizationFee;
            }
            const recentFeeMean = recentFeeSum / recentFeeCountWithoutZeroes;
            const recentFeeMinAvg = Math.min(recentFeeMean, recentFeeMedian);

            // TODO: Do we want to set the compute budget? What should we set it to?
            // Set compute budget
            // instructions.unshift(
            //   ComputeBudgetProgram.setComputeUnitLimit()
            // )

            // Set priority fee
            if (recentFeeMinAvg <= 0) {
              logger.info(
                `getSwap: No recent fees, not setting priority fee` +
                  `  recentFeeCount=${recentFeeCount}` +
                  `  recentFeeCountWithoutZeroes=${recentFeeCountWithoutZeroes}` +
                  `  recentFeeSum=${recentFeeSum}` +
                  `  recentFeeMin=${recentFeeMin}` +
                  `  recentFeeMax=${recentFeeMax}` +
                  `  recentFeeMean=${recentFeeMean}` +
                  `  recentFeeMedian=${recentFeeMedian}` +
                  `  recentFeeMinAvg=${recentFeeMinAvg}`,
              );
            } else {
              logger.info(
                `getSwap: Setting priority fee` +
                  `  priority_fee=${recentFeeMinAvg} micro_lamports/compute_unit` +
                  `  recentFeeCount=${recentFeeCount}` +
                  `  recentFeeCountWithoutZeroes=${recentFeeCountWithoutZeroes}` +
                  `  recentFeeSum=${recentFeeSum}` +
                  `  recentFeeMin=${recentFeeMin}` +
                  `  recentFeeMax=${recentFeeMax}` +
                  `  recentFeeMean=${recentFeeMean}` +
                  `  recentFeeMedian=${recentFeeMedian}` +
                  `  recentFeeMinAvg=${recentFeeMinAvg}`,
              );
              instructions.unshift(
                ComputeBudgetProgram.setComputeUnitPrice({
                  microLamports: recentFeeMinAvg,
                }),
              );
            }

            instructions.push(
              createSPLTransferInstruction(
                /** source */ walletAta,
                /** destination */ payinAta,
                /** owner */ wallet,
                /** amount */ amount,
                /** multiSigners */ [],
                /** programId */ tokenProgramId,
              ),
            );

            versionedTx = new VersionedTransaction(
              new TransactionMessage({
                payerKey: wallet,
                recentBlockhash: latestBlockHash.blockhash,
                instructions,
              }).compileToV0Message(),
            );
          }

          transaction = {
            type: TransactionType.solana,
            from: quote.options.fromAddress,
            to: changellyFixedRateTx.payinAddress,
            serialized: Buffer.from(versionedTx.serialize()).toString("base64"),
            kind: "versioned",
            thirdPartySignatures: [],
          };
          break;
        }

        default: {
          // Not EVM, not SOlana
          transaction = {
            from: quote.options.fromAddress,
            to: changellyFixedRateTx.payinAddress,
            value: numberToHex(quote.options.amount),
            type: TransactionType.generic,
          };
          break;
        }
      }

      // `toBase` fails sometimes because Changelly returns more decimals than the token has
      const fee = 1;
      let baseToAmount: string;
      try {
        baseToAmount = toBase(
          changellyFixedRateTx.amountExpectedTo,
          quote.options.toToken.decimals,
        );
      } catch (err) {
        console.warn(
          `Changelly "createFixTransaction" "amountExpectedTo" possibly returned more` +
            ` decimals than the token has, attempting to trim trailing decimals...` +
            `  amountExpectedTo=${changellyFixedRateTx.amountExpectedTo}` +
            `  toTokenDecimals=${quote.options.toToken.decimals}` +
            `  err=${String(err)}`,
        );
        const original = changellyFixedRateTx.amountExpectedTo;
        // eslint-disable-next-line no-use-before-define
        const [success, fixed] = fixBaseAndTrimDecimals(
          original,
          quote.options.toToken.decimals,
        );
        if (!success) throw err;
        const rounded = (BigInt(fixed) - BigInt(1)).toString();
        baseToAmount = rounded;

        logger.info(
          `getQuote: Fixed amountExpectedTo` +
            `  changellyFixedRateTx.amountExpectedTo=${changellyFixedRateTx.amountExpectedTo}` +
            `  baseToAmount=${baseToAmount}` +
            `  quote.options.toToken.decimals=${quote.options.toToken.decimals}` +
            `  quote.options.toToken.symbol=${quote.options.toToken.symbol}` +
            `  quote.options.toToken.name=${quote.options.toToken.name}` +
            `  quote.options.toToken.address=${quote.options.toToken.address}`,
        );
      }

      const retResponse: ProviderSwapResponse = {
        fromTokenAmount: quote.options.amount,
        provider: this.name,
        toTokenAmount: toBN(baseToAmount).sub(quote.meta.changellynetworkFee),
        additionalNativeFees,
        transactions: [transaction],
        slippage: quote.meta.slippage || DEFAULT_SLIPPAGE,
        fee,
        getStatusObject: async (
          options: StatusOptions,
        ): Promise<StatusOptionsResponse> => ({
          options: {
            ...options,
            swapId: changellyFixedRateTx.id,
          },
          provider: this.name,
        }),
      };
      logger.info(
        `getSwap: Successfully extracted Changelly swap transaction via "createFixTransaction"` +
          `  took=${(Date.now() - startedAt).toLocaleString()}ms`,
      );
      return retResponse;
    } catch (err) {
      console.warn(
        `Errored processing Changelly swap response, returning no swap` +
          `  took=${(Date.now() - startedAt).toLocaleString()}ms` +
          `  err=${String(err)}`,
      );
      return null;
    }
  }

  async getStatus(options: StatusOptions): Promise<TransactionStatus> {
    // TODO: If a Solana transaction hasn't been found after 3 minutes then consider dropping it
    // I'm not sure how Rango's API handles Solana transactions being dropped...

    const params: ChangellyApiGetStatusParams = {
      id: options.swapId,
    };
    const response = await this.changellyRequest<ChangellyApiGetStatusResult>(
      "getStatus",
      params,
    );

    if (response.error || !response.result) return TransactionStatus.pending;
    const completedStatuses = ["finished"];
    const pendingStatuses = [
      "confirming",
      "exchanging",
      "sending",
      "waiting",
      "new",
    ];
    const failedStatuses = ["failed", "refunded", "hold", "expired"];
    const status = response.result;
    if (pendingStatuses.includes(status)) return TransactionStatus.pending;
    if (completedStatuses.includes(status)) return TransactionStatus.success;
    if (failedStatuses.includes(status)) return TransactionStatus.failed;
    return TransactionStatus.pending;
  }
}

function fixBaseAndTrimDecimals(
  value: string,
  decimals: number,
): [success: boolean, fixed: string] {
  const original = value;
  const parts = original.split(".");
  if (parts.length !== 2) return [false, ""]; // More or less than one decimal, something else is wrong
  // Possibly recoverable
  const [integerPart, fractionPart] = parts;
  if (fractionPart.length <= decimals) return [false, ""]; // Some other issue, decimals should be sufficient
  const fractionTrimmed = fractionPart.slice(0, decimals);
  const normalised = `${integerPart}.${fractionTrimmed}`;
  // Round up one (higher price paid) since we lose precision
  const rounded = (BigInt(toBase(normalised, decimals)) + BigInt(1)).toString();
  return [true, rounded];
}

export default Changelly;
