/* eslint-disable no-bitwise */
/* eslint-disable no-extra-label */
/* eslint-disable no-constant-condition */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-label-var */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-template */
/* eslint-disable no-use-before-define */
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
  Token as RangoToken,
  SolanaTransaction as RangoSolanaTransaction,
} from "rango-sdk-basic";
import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  Transaction as SolanaLegacyTransaction,
  TransactionError,
  AccountMeta,
} from "@solana/web3.js";
import fetch from "node-fetch";
import { extractComputeBudget, isValidSolanaAddress } from "../../utils/solana";
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
  SolanaTransaction,
  StatusOptions,
  StatusOptionsResponse,
  SupportedNetworkName,
  SwapQuote,
  TokenType,
  TokenTypeTo,
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

/** Enables debug logging in this file */
const DEBUG = false;

/**
 * curl -sL https://raw.githubusercontent.com/enkryptcom/dynamic-data/refs/heads/main/swaplists/rango.json | jq . -C | less -R
 */
const RANGO_LIST =
  "https://raw.githubusercontent.com/enkryptcom/dynamic-data/refs/heads/main/swaplists/rango.json";

const RANGO_PUBLIC_API_KEY = "ee7da377-0ed8-4d42-aaf9-fa978a32b18d";
const rangoClient = new RangoClient(RANGO_PUBLIC_API_KEY);

let debug: (context: string, message: string, ...args: any[]) => void;
if (DEBUG) {
  debug = (context: string, message: string, ...args: any[]): void => {
    const now = new Date();
    const ymdhms =
      now.getFullYear().toString().padStart(4, "0") +
      "-" +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      now.getDate().toString().padStart(2, "0") +
      " " +
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0") +
      ":" +
      now.getSeconds().toString().padStart(2, "0") +
      "." +
      now.getMilliseconds().toString().padStart(3, "0");
    console.info(
      `\x1b[90m${ymdhms}\x1b[0m \x1b[32mRangoSwapProvider.${context}\x1b[0m: ${message}`,
      ...args
    );
  };
} else {
  debug = () => {};
}

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
    realChainId: string;
    /** Rango's chainId for Solana is "mainnet-beta" */
    rangoChainId: string;
    /** Rango name (Rango's identifier for the chain) of a network */
    name: string;
  };
} = {
  [SupportedNetworkName.Ethereum]: {
    realChainId: "1",
    rangoChainId: "1",
    name: "ETH",
  },
  [SupportedNetworkName.Binance]: {
    realChainId: "56",
    rangoChainId: "56",
    name: "BSC",
  },
  [SupportedNetworkName.Matic]: {
    realChainId: "137",
    rangoChainId: "137",
    name: "POLYGON",
  },
  [SupportedNetworkName.Optimism]: {
    realChainId: "10",
    rangoChainId: "10",
    name: "OPTIMISM",
  },
  [SupportedNetworkName.Avalanche]: {
    realChainId: "43114",
    rangoChainId: "43114",
    name: "AVAX_CCHAIN",
  },
  [SupportedNetworkName.Fantom]: {
    realChainId: "250",
    rangoChainId: "250",
    name: "FANTOM",
  },
  [SupportedNetworkName.Aurora]: {
    realChainId: "1313161554",
    rangoChainId: "1313161554",
    name: "AURORA",
  },
  [SupportedNetworkName.Gnosis]: {
    realChainId: "100",
    rangoChainId: "100",
    name: "GNOSIS",
  },
  [SupportedNetworkName.Arbitrum]: {
    realChainId: "42161",
    rangoChainId: "42161",
    name: "ARBITRUM",
  },
  [SupportedNetworkName.Moonbeam]: {
    realChainId: "1284",
    rangoChainId: "1284",
    name: "MOONBEAM",
  },
  // TODO: Re-enable Solana when all issues with Rango and Solana on Enkrypt are fixed
  // @2024-10-01
  // [SupportedNetworkName.Solana]: {
  //   realChainId: "900",
  //   rangoChainId: "mainnet-beta",
  //   name: "SOLANA",
  // },
  [SupportedNetworkName.Blast]: {
    realChainId: "81457",
    rangoChainId: "81457",
    name: "BLAST",
  },
  [SupportedNetworkName.Telos]: {
    realChainId: "40",
    rangoChainId: "40",
    name: "TELOS",
  },
};

type RangoEnkryptToken = {
  rangoMeta: RangoToken;
  token?: TokenType;
};

class Rango extends ProviderClass {
  tokenList: TokenType[];

  network: SupportedNetworkName;

  web3: Web3Eth | Connection;

  name: ProviderName;

  fromTokens: ProviderFromTokenResponse;

  toTokens: ProviderToTokenResponse;

  rangoMeta: MetaResponse;

  /** From GitHub */
  swaplist: RangoEnkryptToken[];

  /** From GitHub Rango `${rango blockchain name}-${lowercase address}` -> Rango Enkrypt token data */
  swaplistMap: Map<`${string}-${Lowercase<string>}`, RangoEnkryptToken>;

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
    this.swaplist = [];
    this.swaplistMap = new Map();
  }

  async init(tokenList?: TokenType[]): Promise<void> {
    debug("init", `Initialising against ${tokenList?.length} tokens...`);

    const [resMeta, swaplist] = await Promise.all([
      rangoClient.meta({
        excludeNonPopulars: true,
        transactionTypes: [
          RangoTransactionType.EVM,
          // TODO:  re-enable Solana transactions when Rango issues on Solana are fixed
          // RangoTransactionType.SOLANA,
        ],
      }),
      fetchRangoSwaplist(),
    ]);

    const swaplistMap = new Map<
      `${string}-${Lowercase<string>}`,
      RangoEnkryptToken
    >();
    for (let i = 0, len = swaplist.length; i < len; i++) {
      const swaplistToken = swaplist[i];
      const address = swaplistToken.rangoMeta.address ?? NATIVE_TOKEN_ADDRESS;
      const lcaddress = address.toLowerCase() as Lowercase<string>;
      const key: `${string}-${Lowercase<string>}` = `${swaplistToken.rangoMeta.blockchain}-${lcaddress}`;
      swaplistMap.set(key, swaplistToken);
    }

    this.swaplist = swaplist;
    this.swaplistMap = swaplistMap;

    this.rangoMeta = resMeta;
    debug(
      "init",
      "Rango meta" +
        `  tokens.length=${resMeta.tokens.length}` +
        `  blockchains.length=${resMeta.blockchains.length}`
    );

    const { blockchains, tokens } = resMeta;
    if (!Rango.isSupported(this.network, blockchains)) {
      debug("init", `Not supported on network ${this.network}`);
      return;
    }

    tokenList?.forEach((t) => {
      const tokenSupport = tokens.find((token) => token.address === t.address);
      if (this.isNativeToken(t.address) || tokenSupport) {
        this.fromTokens[t.address] = t;
      }
    });

    debug("init", `Finished initialising`);
  }

  /**
   * Do we support any of the blockchains that Rango supports?
   */
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
      const [, { rangoChainId }] = Object.entries(supportedNetworks).find(
        ([supportedNetworkName]) =>
          supportedNetworkName === (network as unknown as string)
      );
      const enabled = !!blockchains.find((rangoBlockchain: BlockchainMeta) =>
        rangoChainIdsEq(rangoBlockchain.chainId, rangoChainId)
      )?.enabled;
      return enabled;
    }

    // Rango didn't give us anything so just assume Rango supports this network
    return true;
  }

  getFromTokens(): ProviderFromTokenResponse {
    return this.fromTokens;
  }

  getToTokens(): ProviderToTokenResponse {
    const { tokens } = this.rangoMeta;
    const supportedCRangoNames = Object.values(supportedNetworks).map(
      (s) => s.name
    );
    const rangoToNetwork: Record<string, SupportedNetworkName> = {};
    Object.keys(supportedNetworks).forEach((net) => {
      rangoToNetwork[supportedNetworks[net].name] =
        net as unknown as SupportedNetworkName;
    });

    tokens?.forEach((rangoToken) => {
      // Unrecognised network
      if (!supportedCRangoNames.includes(rangoToken.blockchain)) return;

      const network = rangoToNetwork[rangoToken.blockchain];

      this.toTokens[network] ??= {};

      const address = rangoToken.address || NATIVE_TOKEN_ADDRESS;
      const lcaddress = address.toLowerCase() as Lowercase<string>;
      const key: `${string}-${Lowercase<string>}` = `${rangoToken.blockchain}-${lcaddress}`;
      const swaplistToken = this.swaplistMap.get(key);

      let type: NetworkType;
      switch (network) {
        case SupportedNetworkName.Solana:
          type = NetworkType.Solana;
          break;
        default:
          type = NetworkType.EVM;
          break;
      }

      const toToken: TokenTypeTo = {
        ...rangoToken,
        address,
        name: rangoToken.name || rangoToken.symbol,
        logoURI: rangoToken.image,
        type,
        price: rangoToken.usdPrice,
        cgId: swaplistToken?.token?.cgId,
        symbol: rangoToken.symbol,
        decimals: rangoToken.decimals,
        balance: undefined,
        rank: swaplistToken?.token?.rank,
        networkInfo: {
          name: rangoToNetwork[rangoToken.blockchain],
          isAddress: getIsAddressAsync(network),
        },
      };
      this.toTokens[network][address] = toToken;
    });

    return this.toTokens;
  }

  /**
   * Returns the symbol in Rango's specific form from the meta information.
   * For cross-chain tokens like Ethereum (ETH) on the Binance Smart Chain (BSC) network,
   * it returns the corresponding symbol like WETH.
   */
  private getSymbol(token: TokenType): string | undefined {
    const { tokens } = this.rangoMeta;
    if (this.isNativeToken(token.address)) return token.symbol;
    if (token.address == null) {
      console.warn(
        `Cannot get Rango token symbol: Token address is not defined` +
          ` for token ${token.name} (${token.symbol}) - ${token.address}`
      );
      return undefined;
    }
    const lc = token.address.toLowerCase();
    return Object.values(tokens || []).find(
      (t) => t.address?.toLowerCase() === lc
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
    accurateEstimate: boolean,
    abortable?: { signal?: AbortSignal }
  ): Promise<RangoSwapResponse | null> {
    const { blockchains } = this.rangoMeta;
    const startedAt = Date.now();

    debug(
      "getRangoSwap",
      `Getting swap` +
        `  srcToken=${options.fromToken.symbol}` +
        `  dstToken=${options.toToken.symbol}` +
        `  fromAddress=${options.fromAddress}` +
        `  toAddress=${options.toAddress}` +
        `  fromNetwork=${this.network}` +
        `  toNetwork=${options.toToken.networkInfo.name}`
    );

    try {
      // Determine whether Enkrypt + Rango supports this swap
      abortable?.signal?.throwIfAborted();

      // Do we support Rango on this network?
      if (
        !Rango.isSupported(
          options.toToken.networkInfo.name as SupportedNetworkName,
          blockchains
        ) ||
        !Rango.isSupported(this.network, blockchains)
      ) {
        debug(
          "getRangoSwap",
          `No swap:` +
            ` Enkrypt does not support Rango swap on the destination` +
            ` network ${options.toToken.networkInfo.name}`
        );
        return Promise.resolve(null);
      }

      // Does Rango support these tokens?
      const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];

      /** Source token Rango blockchain name */
      const fromBlockchain = blockchains.find((rangoBlockchain) =>
        rangoChainIdsEq(
          rangoBlockchain.chainId,
          supportedNetworks[this.network].rangoChainId
        )
      )?.name;

      /** Destination token Rango blockchain name */
      const toBlockchain = blockchains.find((rangoBlockchain) =>
        rangoChainIdsEq(
          rangoBlockchain.chainId,
          supportedNetworks[options.toToken.networkInfo.name].rangoChainId
        )
      )?.name;

      debug(
        "getRangoSwap",
        `Rango block chains ids` +
          `  fromBlokchain=${fromBlockchain}` +
          `  toBlockchain=${toBlockchain}`
      );

      const fromTokenAddress = options.fromToken.address;
      const toTokenAddress = options.toToken.address;

      /** Source token symbol */
      const fromSymbol = this.getSymbol(options.fromToken);

      /** Destination token symbol */
      const toSymbol = this.getSymbol(options.toToken);

      // If we can't get symbols for the tokens then we don't support them
      if (!fromSymbol || !toSymbol) {
        debug(
          "getRangoSwap",
          `No swap: No symbol for src token or dst token` +
            `  srcTokenSymbol=${fromSymbol}` +
            `  dstTokenSymbol=${toSymbol}`
        );
        return Promise.resolve(null);
      }

      // Enkrypt & Rango both likely support this swap (pair & networks)

      const slippage = Number(meta.slippage || DEFAULT_SLIPPAGE);
      if (!Number.isFinite(slippage)) {
        throw new Error(`Slippage is not a number: ${slippage}`);
      }

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
        slippage,
        referrerFee: feeConfig ? (feeConfig.fee * 100).toFixed(3) : undefined,
        referrerAddress: feeConfig?.referrer || undefined,
        disableEstimate: true,
      };

      debug(
        "getRangoSwap",
        `Requesting quote from rango sdk...` +
          `  fromBlockchain=${fromBlockchain}` +
          `  toBlockchain=${toBlockchain}` +
          `  fromToken=${fromSymbol}` +
          `  toToken=${toSymbol}` +
          `  fromAddress=${options.fromAddress}` +
          `  toAddress=${options.toAddress}` +
          `  amount=${options.amount.toString()}` +
          `  slippage=${slippage}` +
          `  referrerFee=${params.referrerFee}`
      );
      const rangoSwapResponse = await rangoClient.swap(params);
      debug("getRangoSwap", `Received quote from rango sdk`);

      abortable?.signal?.throwIfAborted();

      if (
        rangoSwapResponse.error ||
        rangoSwapResponse.resultType !== RoutingResultType.OK
      ) {
        // Rango experienced some kind of error or is unable to route the swap
        debug("getRangoSwap", `Rango swap SDK returned an error`);
        console.error("Rango swap SDK error:", rangoSwapResponse.error);
        return Promise.resolve(null);
      }

      debug("getRangoSwap", `Rango swap SDK returned OK`);

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

      debug(
        "getRangoSwap",
        `Additional non-network source fees ${additionalNativeFees.toString()}`
      );

      // Fill in gas values, add approval transactions, etc
      let networkTransactions: RangoNetworkedTransactions;

      switch (rangoSwapResponse.tx?.type) {
        // Process Rango swap EVM transaction
        case RangoTransactionType.EVM: {
          debug("getRangoSwap", `Received EVM transaction`);

          const transactions: EVMTransaction[] = [];
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

            abortable?.signal?.throwIfAborted();
          }

          networkTransactions = { type: NetworkType.EVM, transactions };
          break;
        }

        // Process Rango swap Solana transaction
        case RangoTransactionType.SOLANA: {
          const conn = this.web3 as Connection;
          debug("getRangoSwap", "Received Solana transaction");

          let enkSolTx: SolanaTransaction;
          switch (rangoSwapResponse.tx.txType) {
            case "LEGACY": {
              let legacyTx: SolanaLegacyTransaction;
              if (rangoSwapResponse.tx.serializedMessage) {
                debug(
                  "getRangoSwap",
                  `Deserializing Solana legacy unsigned transaction`
                );
                // Legacy transaction, not signed (we can modify it)
                // > When serialized message appears, there is no need for other fields and you just sign and send it
                // @see (2024-09-17) https://docs.rango.exchange/api-integration/main-api-multi-step/sample-transactions#solana-sample-transaction-test
                legacyTx = SolanaLegacyTransaction.from(
                  rangoSwapResponse.tx.serializedMessage
                );
              } else {
                debug(
                  "getRangoSwap",
                  `Constructing Solana legacy signed transaction`
                );
                // Legacy transaction signed by Rango, we cannot alter this transaction
                // Since the recent block hash gets signed too, this transaction will need to be consumed quickly
                const msg = extractTransactionMessageFromSignedRangoTransaction(
                  rangoSwapResponse.tx
                );
                legacyTx = SolanaLegacyTransaction.populate(
                  msg.compileToLegacyMessage()
                );
              }

              debug(
                "getRangoSwap",
                "Extracting third party Rango signatures..."
              );
              const thirdPartySignatures =
                extractSignaturesFromRangoTransaction(rangoSwapResponse.tx);

              // Verify Rango signatures incase rango gives us invalid transaction signatures
              debug("getRangoSwap", "Checking Rango signatures...");
              const signaturesAreValid = checkSolanaLegacyTransactionSignatures(
                legacyTx,
                thirdPartySignatures
              );
              if (!signaturesAreValid) {
                let warnMsg = `Rango Solana signed legacy transaction has invalid Rango signatures,`;
                warnMsg += `  dropping Rango swap transaction`;
                for (
                  let tpsigi = 0;
                  tpsigi < thirdPartySignatures.length;
                  tpsigi++
                ) {
                  const sig = thirdPartySignatures[tpsigi];
                  warnMsg += `  sig[${tpsigi}].pubkey=${sig.pubkey}`;
                  warnMsg += `  sig[${tpsigi}].signature=0x${Buffer.from(
                    sig.signature
                  ).toString("hex")}`;
                }
                warnMsg += `  fromBlockchain=${fromBlockchain}`;
                warnMsg += `  toBlockchain=${toBlockchain}`;
                warnMsg += `  fromToken=${fromSymbol}`;
                warnMsg += `  toToken=${toSymbol}`;
                warnMsg += `  fromAddress=${options.fromAddress}`;
                warnMsg += `  toAddress=${options.toAddress}`;
                warnMsg += `  amount=${options.amount.toString()}`;
                warnMsg += `  slippage=${slippage}`;
                warnMsg += `  referrerFee=${params.referrerFee}`;
                console.warn(warnMsg);
                return null;
              }

              // Sometimes Rango gives us bad transactions @ 2024-09-25
              // Simulate the transaction to check if it actually works so we don't use it to quote the user
              debug("getRangoSwap", "Simulating transaction...");
              const statusResult =
                await checkExpectedSolanaLegacyTransactionStatus(
                  conn,
                  legacyTx,
                  thirdPartySignatures.length > 0,
                  abortable
                );
              if (!statusResult.succeeds) {
                let warnMsg = `Failed to simulate Rango Solana`;
                if (thirdPartySignatures.length > 0) warnMsg += ` signed`;
                else warnMsg += ` unsigned`;
                warnMsg += ` legacy transaction,`;
                warnMsg += ` dropping Rango swap transaction`;
                warnMsg += `  fromBlockchain=${fromBlockchain}`;
                warnMsg += `  toBlockchain=${toBlockchain}`;
                warnMsg += `  fromToken=${fromSymbol}`;
                warnMsg += `  toToken=${toSymbol}`;
                warnMsg += `  fromAddress=${options.fromAddress}`;
                warnMsg += `  toAddress=${options.toAddress}`;
                warnMsg += `  amount=${options.amount.toString()}`;
                warnMsg += `  slippage=${slippage}`;
                warnMsg += `  referrerFee=${params.referrerFee}`;
                console.warn(warnMsg, statusResult.error);
                return null;
              }

              abortable?.signal?.throwIfAborted();

              enkSolTx = {
                type: TransactionType.solana,
                from: rangoSwapResponse.tx.from,
                to: options.toToken.address,
                kind: "legacy",
                serialized: legacyTx
                  .serialize({ requireAllSignatures: false })
                  .toString("base64"),
                thirdPartySignatures,
              };
              break;
            }
            case "VERSIONED": {
              let versionedTx: VersionedTransaction;
              if (rangoSwapResponse.tx.serializedMessage) {
                debug(
                  "getRangoSwap",
                  `Deserializing Solana versioned unsigned transaction`
                );
                // Versioned transaction, not signed (we can modify it)
                // > When serialized message appears, there is no need for other fields and you just sign and send it
                // @see (2024-09-17) https://docs.rango.exchange/api-integration/main-api-multi-step/sample-transactions#solana-sample-transaction-test
                const bytes = new Uint8Array(
                  rangoSwapResponse.tx.serializedMessage
                );
                versionedTx = VersionedTransaction.deserialize(bytes);
              } else {
                debug(
                  "getRangoSwap",
                  `Constructing Solana versioned signed transaction`
                );
                // Versioned transaction signed by Rango, we cannot alter this transaction
                // Since the recent block hash gets signed too, this transaction will need to be consumed quickly
                const msg = extractTransactionMessageFromSignedRangoTransaction(
                  rangoSwapResponse.tx
                );
                versionedTx = new VersionedTransaction(
                  msg.compileToV0Message()
                );
              }

              debug(
                "getRangoSwap",
                "Extracting third party Rango signatures..."
              );
              const thirdPartySignatures =
                extractSignaturesFromRangoTransaction(rangoSwapResponse.tx);

              // Verify Rango signatures incase rango gives us invalid transaction signatures
              debug("getRangoSwap", "Checking Rango signatures...");
              const signaturesAreValid =
                checkSolanaVersionedTransactionSignatures(
                  versionedTx,
                  thirdPartySignatures
                );
              if (!signaturesAreValid) {
                let warnMsg = `Rango Solana signed versioned transaction has invalid Rango signatures,`;
                warnMsg += `  dropping Rango swap transaction`;
                for (
                  let tpsigi = 0;
                  tpsigi < thirdPartySignatures.length;
                  tpsigi++
                ) {
                  const sig = thirdPartySignatures[tpsigi];
                  warnMsg += `  sig[${tpsigi}].pubkey=${sig.pubkey}`;
                  warnMsg += `  sig[${tpsigi}].signature=0x${Buffer.from(
                    sig.signature
                  ).toString("hex")}`;
                }
                warnMsg += `  fromBlockchain=${fromBlockchain}`;
                warnMsg += `  toBlockchain=${toBlockchain}`;
                warnMsg += `  fromToken=${fromSymbol}`;
                warnMsg += `  toToken=${toSymbol}`;
                warnMsg += `  fromAddress=${options.fromAddress}`;
                warnMsg += `  toAddress=${options.toAddress}`;
                warnMsg += `  amount=${options.amount.toString()}`;
                warnMsg += `  slippage=${slippage}`;
                warnMsg += `  referrerFee=${params.referrerFee}`;
                console.warn(warnMsg);
                return null;
              }

              // Sometimes Rango gives us bad transactions @ 2024-09-25
              // so we don't let them quote the user
              debug("getRangoSwap", "Simulating transaction...");
              const statusResult =
                await checkExpectedSolanaVersionedTransactionStatus(
                  conn,
                  versionedTx,
                  thirdPartySignatures.length > 0,
                  abortable
                );
              if (!statusResult.succeeds) {
                let warnMsg = `Failed to simulate Rango Solana`;
                if (thirdPartySignatures.length > 0) warnMsg += ` signed`;
                else warnMsg += ` unsigned`;
                warnMsg += ` versioned transaction,`;
                warnMsg += ` dropping Rango swap transaction`;
                warnMsg += `  fromBlockchain=${fromBlockchain}`;
                warnMsg += `  toBlockchain=${toBlockchain}`;
                warnMsg += `  fromToken=${fromSymbol}`;
                warnMsg += `  toToken=${toSymbol}`;
                warnMsg += `  fromAddress=${options.fromAddress}`;
                warnMsg += `  toAddress=${options.toAddress}`;
                warnMsg += `  amount=${options.amount.toString()}`;
                warnMsg += `  slippage=${slippage}`;
                warnMsg += `  referrerFee=${params.referrerFee}`;
                console.warn(warnMsg, statusResult.error);
                return null;
              }

              abortable?.signal?.throwIfAborted();

              enkSolTx = {
                type: TransactionType.solana,
                from: rangoSwapResponse.tx.from,
                to: options.toToken.address,
                kind: "legacy",
                serialized: Buffer.from(versionedTx.serialize()).toString(
                  "base64"
                ),
                thirdPartySignatures,
              };
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
            transactions: [enkSolTx],
          };
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

      debug(
        "getRangoSwap",
        `Done  took=${(Date.now() - startedAt).toLocaleString()}ms`
      );

      return result;
    } catch (err) {
      if (abortable?.signal?.aborted && err === abortable.signal.reason) {
        // Aborted & error is the abort error
        return null;
      }
      console.error(
        `Error getting Rango swap, returning empty response (no swap)`,
        err
      );
      return null;
    }
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    abortable?: { signal: AbortSignal }
  ): Promise<ProviderQuoteResponse | null> {
    const res = await this.getRangoSwap(options, meta, false, abortable);
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

  async getSwap(
    quote: SwapQuote,
    abortable?: { signal: AbortSignal }
  ): Promise<ProviderSwapResponse | null> {
    const res = await this.getRangoSwap(
      quote.options,
      quote.meta,
      true,
      abortable
    );
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

async function isEVMAddressAsync(address: string): Promise<boolean> {
  return isEVMAddress(address);
}
async function isSolanaAddressAsync(address: string): Promise<boolean> {
  return isValidSolanaAddress(address);
}

function getIsAddressAsync(
  network: SupportedNetworkName
): (address: string) => Promise<boolean> {
  switch (network) {
    case SupportedNetworkName.Solana:
      return isSolanaAddressAsync;
    default:
      return isEVMAddressAsync;
  }
}

function sleep(
  duration: number,
  abortable?: { signal?: AbortSignal }
): Promise<void> {
  if (abortable?.signal?.aborted)
    return Promise.reject(abortable.signal.reason);
  if (duration <= 0) return Promise.resolve();
  return new Promise<void>((res, rej) => {
    const onTimeout = () => {
      cleanup();
      res();
    };
    const onAbort = () => {
      cleanup();
      rej(abortable!.signal!.reason);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      abortable?.signal?.removeEventListener("abort", onAbort);
    };
    const timeout = setTimeout(onTimeout, duration);
    abortable?.signal?.addEventListener("abort", onAbort);
  });
}

async function fetchRangoSwaplist(abortable?: {
  signal?: AbortSignal;
}): Promise<RangoEnkryptToken[]> {
  const url = RANGO_LIST;
  const retries = [0, 1_000, 2_000, 5_000];
  let retryidx = 0;
  let errref: undefined | { err: Error };
  let result: RangoEnkryptToken[];
  retries: while (true) {
    if (retryidx >= retries.length) {
      throw new Error(
        `Failed to fetch Rango swaplists after ${retries.length}` +
          ` retries: ${String(errref?.err ?? "???")}`
      );
    }
    const waitMs = retries[retryidx];
    if (waitMs > 0) {
      console.debug(`Retrying Rango swaplists in ${waitMs}ms...`);
      await sleep(waitMs, abortable);
    }
    if (retryidx > 0) {
      console.debug(`Retrying Rango swaplists...`);
    }

    const aborter = new AbortController();
    const onTimeout = () => {
      cleanup();
      aborter.abort(new Error(`Rango swaplists HTTP request timed`));
    };
    const onAbort = () => {
      cleanup();
      aborter.abort(abortable!.signal!.reason);
    };
    const cleanup = () => {
      clearTimeout(requestTimeout);
      abortable?.signal?.removeEventListener("abort", onAbort);
    };
    const requestTimeout = setTimeout(onTimeout, 30_000);
    abortable?.signal?.addEventListener("abort", onAbort);
    try {
      const res = await fetch(RANGO_LIST, {
        signal: aborter.signal,
        headers: [["Accept", "application/json"]],
      });
      if (!res.ok) {
        let msg = await res
          .text()
          .catch((err) => `! Failed to decode response text: ${String(err)}`);
        const len = msg.length;
        if (len > 512 + 10 + len.toString().length)
          msg = `${msg.slice(0, 512)}... (512/${len})`;
        throw new Error(
          `Failed to fetch Rango swaplists with ${res.status} ${res.statusText} ${url} ${msg}`
        );
      }
      const json = await res.json();
      result = json as RangoEnkryptToken[];
      break retries;
    } catch (err) {
      console.warn(`Failed to fetch Rango swaplists`, err);
      errref ??= { err: err as Error };
    } finally {
      cleanup();
    }
    retryidx++;
  }

  if (!result) throw new Error("Something went wrong: result is falsy");
  if (!Array.isArray(result))
    throw new Error(`Expected array but got ${typeof result}`);

  return result;
}

function extractSignaturesFromRangoTransaction(
  rangoSolanaTx: RangoSolanaTransaction
): {
  /** Base58 public key */
  pubkey: string;
  /** Uint8 byte Array */
  signature: number[];
}[] {
  const apiThirdPartySignatures = rangoSolanaTx.signatures;
  const thirdPartySigCount = apiThirdPartySignatures.length;
  const thirdPartySignatures: {
    /** Base58 */
    pubkey: string;
    /** Uint8 byte array */
    signature: number[];
  }[] = new Array(thirdPartySigCount);
  for (let tpsigi = 0; tpsigi < thirdPartySigCount; tpsigi++) {
    const { signature: int8sig, publicKey } = apiThirdPartySignatures[tpsigi];
    const sigSize = int8sig.length;
    const uint8sig = new Array<number>(sigSize);
    // Rango gives us back signatures & data in int8 arrays instead of uint8 arrays
    for (let sigbytei = 0; sigbytei < sigSize; sigbytei++) {
      // int8 to uint8
      uint8sig[sigbytei] = int8sig[sigbytei] & 0xff;
    }
    thirdPartySignatures[tpsigi] = {
      pubkey: publicKey,
      signature: uint8sig,
    };
  }
  return thirdPartySignatures;
}

function extractTransactionMessageFromSignedRangoTransaction(
  rangoSolanaTx: RangoSolanaTransaction
): TransactionMessage {
  // Extract instructions
  const apiInstructions = rangoSolanaTx.instructions;
  const instructionCount = apiInstructions.length;
  const instructions = new Array<TransactionInstruction>(instructionCount);
  for (let instri = 0; instri < instructionCount; instri++) {
    const apiInstruction = apiInstructions[instri];
    const apiInstructionKeys = apiInstruction.keys;
    const keyCount = apiInstructionKeys.length;
    const keys = new Array<AccountMeta>(keyCount);
    for (let keyi = 0; keyi < keyCount; keyi++) {
      const { pubkey, isSigner, isWritable } = apiInstructionKeys[keyi];
      keys[keyi] = {
        isWritable,
        isSigner,
        pubkey: new PublicKey(pubkey),
      };
    }
    instructions[instri] = new TransactionInstruction({
      keys,
      data: Buffer.from(apiInstruction.data),
      programId: new PublicKey(apiInstruction.programId),
    });
  }

  // Extract message

  const msg = new TransactionMessage({
    instructions,
    recentBlockhash: rangoSolanaTx.recentBlockhash,
    payerKey: new PublicKey(rangoSolanaTx.from),
  });

  return msg;
}

function checkSolanaLegacyTransactionSignatures(
  legacyTx: SolanaLegacyTransaction,
  thirdPartySignatures: {
    /** Base58 */
    pubkey: string;
    /** Uint8 byte array */
    signature: number[];
  }[]
): boolean {
  if (thirdPartySignatures.length === 0) return true;

  // TODO: does it matter that we sign here? probably not
  // cloning doesn't seem to work (says rangoSignaturesAreValid=false for some reason)
  // const clonedTx = SolanaLegacyTransaction.from(legacyTx.serialize({ requireAllSignatures: false, }))
  const clonedTx = legacyTx;
  for (let tpsigi = 0; tpsigi < thirdPartySignatures.length; tpsigi++) {
    const sig = thirdPartySignatures[tpsigi];
    clonedTx.addSignature(
      new PublicKey(sig.pubkey),
      Buffer.from(sig.signature)
    );
  }
  const rangoSignaturesAreValid = clonedTx.verifySignatures(false);
  return rangoSignaturesAreValid;
}

function checkSolanaVersionedTransactionSignatures(
  versionedTx: VersionedTransaction,
  thirdPartySignatures: {
    /** Base58 */
    pubkey: string;
    /** Uint8 byte array */
    signature: number[];
  }[]
): boolean {
  if (thirdPartySignatures.length === 0) return true;

  const clonedTx = VersionedTransaction.deserialize(versionedTx.serialize());
  for (let tpsigi = 0; tpsigi < thirdPartySignatures.length; tpsigi++) {
    const sig = thirdPartySignatures[tpsigi];
    // TODO: does this actually verify signatures?
    // There appears to be no verifyTransaction method to use?
    try {
      clonedTx.addSignature(
        new PublicKey(sig.pubkey),
        Buffer.from(sig.signature)
      );
    } catch (err) {
      // Does this happen?
      // If not we can check with tweetnacl
      console.error(`Failed to add signature to versioned transaction`, err);
      return false;
    }
  }
  return true;
}

/**
 * Sometimes simulation fails because block hash isn't recent enough, or is too recent,
 * so we'll modify the block hash and retry a few times in-case (only works for unsigned
 * transactions)
 */
async function checkExpectedSolanaLegacyTransactionStatus(
  conn: Connection,
  legacyTx: SolanaLegacyTransaction,
  signed: boolean,
  abortable?: { signal?: AbortSignal }
): Promise<
  | { succeeds: true; error?: undefined }
  | { succeeds: false; error: TransactionError }
> {
  const retries = [0, 1_000, 2_000];
  let retryidx = 0;
  let errref: undefined | { txerr: TransactionError };
  let success = false;
  while (!success) {
    if (retryidx >= retries.length) {
      return { succeeds: false, error: errref!.txerr };
    }
    const waitms = retries[retryidx];
    if (waitms > 0) await sleep(waitms, abortable);
    if (retryidx > 0 && signed) {
      // Sometimes simulation fails because block hash isn't recent enough, or is too recent,
      // so we'll modify the block hash and retry a few times in-case (only works for unsigned
      // transactions)
      const latestBlockHash = await conn.getLatestBlockhash();
      debug(
        "checkExpectedSolanaLegacyTransactionStatus",
        `Retrying Rango Solana unsigned legacy transaction simulation` +
          ` with updated block hash ${latestBlockHash.blockhash}...`
      );
      legacyTx.recentBlockhash = latestBlockHash.blockhash;
    }
    const sim = await conn.simulateTransaction(legacyTx);
    if (sim.value.err) {
      // Simulation failed, we must retry or exit. Something is wrong with the Rango transaction.
      let warnMsg = "Rango Solana";
      if (signed) warnMsg += ` signed`;
      else warnMsg += ` unsigned`;
      warnMsg += ` legacy transaction failed simulation`;
      warnMsg += ` on attempt ${retryidx + 1}`;
      console.warn(warnMsg, sim.value.err);
      errref = { txerr: sim.value.err };
    } else {
      // Simulation succeeded, we can continue
      success = true;
    }
    retryidx++;
  }
  return { succeeds: true };
}

/**
 * Sometimes simulation fails because block hash isn't recent enough, or is too recent,
 * so we'll modify the block hash and retry a few times in-case (only works for unsigned
 * transactions)
 */
async function checkExpectedSolanaVersionedTransactionStatus(
  conn: Connection,
  versionedTx: VersionedTransaction,
  signed: boolean,
  abortable?: { signal?: AbortSignal }
): Promise<
  | { succeeds: true; error?: undefined }
  | { succeeds: false; error: TransactionError }
> {
  const retries = [0, 1_000, 2_000];
  let retryidx = 0;
  let errref: undefined | { txerr: TransactionError };
  let success = false;
  while (!success) {
    if (retryidx >= retries.length) {
      return { succeeds: false, error: errref!.txerr };
    }
    const waitms = retries[retryidx];
    if (waitms > 0) await sleep(waitms, abortable);
    if (retryidx > 0 && signed) {
      // Sometimes simulation fails because block hash isn't recent enough, or is too recent,
      // so we'll modify the block hash and retry a few times in-case (only works for unsigned
      // transactions)
      const latestBlockHash = await conn.getLatestBlockhash();
      debug(
        "checkExpectedSolanaVersionedTransactionStatus",
        `Retrying Rango Solana unsigned versioned transaction simulation` +
          ` with updated block hash ${latestBlockHash.blockhash}...`
      );
      versionedTx.message.recentBlockhash = latestBlockHash.blockhash;
    }
    const sim = await conn.simulateTransaction(versionedTx, {
      sigVerify: false,
    });
    if (sim.value.err) {
      // Simulation failed, we must retry or exit. Something is wrong with the Rango transaction.
      let warnMsg = "Rango Solana";
      if (signed) warnMsg += ` signed`;
      else warnMsg += ` unsigned`;
      warnMsg += ` versioned transaction failed simulation`;
      warnMsg += ` on attempt ${retryidx + 1}`;
      console.warn(warnMsg, sim.value.err);
      errref = { txerr: sim.value.err };
    } else {
      // Simulation succeeded, we can continue
      success = true;
    }
    retryidx++;
  }
  return { succeeds: true };
}

/**
 * Check whether two rango blockchain id's are equal
 *
 * (Rango blockchain ids are not strictly numeric)
 *
 * Sometimes Rango chainId will be a number, sometimes it'll be something else
 * for example they use "mainnet-beta" for Solana but for most (all?) EVM it
 * has an 0x prefixed hex number
 */
function rangoChainIdsEq(chainIdA: string, chainIdB: string): boolean {
  const chainIdANumber = Number(chainIdA);
  const chainIdBNumber = Number(chainIdB);
  const aIsNumber = Number.isSafeInteger(chainIdANumber);
  const bIsNumber = Number.isSafeInteger(chainIdBNumber);
  if (aIsNumber && bIsNumber) return chainIdANumber === chainIdBNumber;
  if (!aIsNumber && !bIsNumber) return chainIdA === chainIdB;
  return false;
}

export default Rango;
