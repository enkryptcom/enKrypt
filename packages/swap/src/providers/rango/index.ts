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
import { DebugLogger } from "@enkryptcom/utils";

const logger = new DebugLogger("swap:rango");

/**
 * curl -sL https://raw.githubusercontent.com/enkryptcom/dynamic-data/refs/heads/main/swaplists/rango.json | jq . -C | less -R
 */
const RANGO_LIST =
  "https://raw.githubusercontent.com/enkryptcom/dynamic-data/refs/heads/main/swaplists/rango.json";

const RANGO_PUBLIC_API_KEY = "ee7da377-0ed8-4d42-aaf9-fa978a32b18d";
const rangoClient = new RangoClient(RANGO_PUBLIC_API_KEY);

type SupportedNetworkInfo = {
  /** Standard base10 chain ID, can be obtained from `https://chainlist.org` */
  realChainId: string;
  /** Rango's chainId for Solana is "mainnet-beta" */
  rangoChainId: string;
  /** Rango blockchain name (Rango's identifier for the chain) of a network */
  rangoBlockchain: string;
};

/**
 * `name` is the blockchain id on Rango
 *
 * You can use the Rango API to get a list of tokens to figure out the Rango name of a network
 *
 * @see https://rango-api.readme.io/reference/meta
 *
 * ```sh
 * # Rango token meta (list of all tokens with token metadata, blockchain info, etc)
 * curl 'https://api.rango.exchange/basic/meta?apiKey=c6381a79-2817-4602-83bf-6a641a409e32' -sL -H 'Accept:application/json' | jq .
 * # {
 * #   "tokens": [
 * #     {
 * #       "blockchain": "ETH",
 * #       "symbol": "USDT",
 * #       "name": "USD Tether",
 * #       "isPopular": true,
 * #       "chainId": "1",
 * #       "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
 * #       "decimals": 6,
 * #       "image": "https://rango.vip/i/r3Oex6",
 * #       "blockchainImage": "https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ETH/icon.svg",
 * #       "usdPrice": 1.001,
 * #       "supportedSwappers": [
 * #         "Arbitrum Bridge",
 * #         "ThorChain",
 * # ...
 *
 * # Rango token count per blockchain
 * curl 'https://api.rango.exchange/basic/meta?apiKey=c6381a79-2817-4602-83bf-6a641a409e32' -sL -H 'Accept:application/json' | jq --raw-output .tokens[].blockchain | sort | uniq -c | sort -n
 * # count blockchain
 * # ...
 * #    36 MOONBEAM
 * #    42 CELO
 * #    48 OKC
 * #    50 MOONRIVER
 * #    55 AURORA
 * #    56 LINEA
 * #    58 ZKSYNC
 * #    61 BLAST
 * #   146 OSMOSIS
 * #   147 HECO
 * #   158 CRONOS
 * #   301 OPTIMISM
 * #   368 AVAX_CCHAIN
 * #   437 BASE
 * #   594 POLYGON
 * #   596 ARBITRUM
 * #   833 BSC
 * #  1509 SOLANA
 * #  5610 ETH
 *
 * # Rango token count per blockchain & chain id
 * curl 'https://api.rango.exchange/basic/meta?apiKey=c6381a79-2817-4602-83bf-6a641a409e32' -sL -H 'Accept:application/json' | jq -r '.tokens[] | "\(.blockchain)\t\(.chainId)"' | sort | uniq -c | sort -n | sed 's/^ *\([0-9]*\) *\(.*\)/\1\t\2/' | column -s $'\t' -t
 * # count blockchain     chain id
 * # ...
 * # 50    MOONRIVER      1285
 * # 55    AURORA         1313161554
 * # 56    LINEA          59144
 * # 58    ZKSYNC         324
 * # 61    BLAST          81457
 * # 146   OSMOSIS        osmosis-1
 * # 147   HECO           128
 * # 158   CRONOS         25
 * # 301   OPTIMISM       10
 * # 368   AVAX_CCHAIN    43114
 * # 437   BASE           8453
 * # 594   POLYGON        137
 * # 596   ARBITRUM       42161
 * # 833   BSC            56
 * # 1509  SOLANA         mainnet-beta
 * # 5610  ETH            1
 * ```
 */
const supportedNetworks: Readonly<{
  [key in SupportedNetworkName]?: SupportedNetworkInfo;
}> = {
  [SupportedNetworkName.Ethereum]: {
    realChainId: "1",
    rangoChainId: "1",
    rangoBlockchain: "ETH",
  },
  [SupportedNetworkName.Binance]: {
    realChainId: "56",
    rangoChainId: "56",
    rangoBlockchain: "BSC",
  },
  [SupportedNetworkName.Matic]: {
    realChainId: "137",
    rangoChainId: "137",
    rangoBlockchain: "POLYGON",
  },
  [SupportedNetworkName.Optimism]: {
    realChainId: "10",
    rangoChainId: "10",
    rangoBlockchain: "OPTIMISM",
  },
  [SupportedNetworkName.Avalanche]: {
    realChainId: "43114",
    rangoChainId: "43114",
    rangoBlockchain: "AVAX_CCHAIN",
  },
  [SupportedNetworkName.Fantom]: {
    realChainId: "250",
    rangoChainId: "250",
    rangoBlockchain: "FANTOM",
  },
  [SupportedNetworkName.Aurora]: {
    realChainId: "1313161554",
    rangoChainId: "1313161554",
    rangoBlockchain: "AURORA",
  },
  [SupportedNetworkName.Gnosis]: {
    realChainId: "100",
    rangoChainId: "100",
    rangoBlockchain: "GNOSIS",
  },
  [SupportedNetworkName.Arbitrum]: {
    realChainId: "42161",
    rangoChainId: "42161",
    rangoBlockchain: "ARBITRUM",
  },
  [SupportedNetworkName.Moonbeam]: {
    realChainId: "1284",
    rangoChainId: "1284",
    rangoBlockchain: "MOONBEAM",
  },
  [SupportedNetworkName.Solana]: {
    realChainId: "900",
    rangoChainId: "mainnet-beta",
    rangoBlockchain: "SOLANA",
  },
  [SupportedNetworkName.Blast]: {
    realChainId: "81457",
    rangoChainId: "81457",
    rangoBlockchain: "BLAST",
  },
  [SupportedNetworkName.Telos]: {
    realChainId: "40",
    rangoChainId: "40",
    rangoBlockchain: "TELOS",
  },
};

// Freeze because we index below so modifications would make the indexes stale
Object.freeze(supportedNetworks);

/** Enkrypt supported network name -> network info */
const supportedNetworkInfoByName = new Map(
  Object.entries(supportedNetworks),
) as unknown as Map<SupportedNetworkName, SupportedNetworkInfo>;

/** Rango blockchain name -> network info & enkrypt network name */
const supportedNetworkByRangoBlockchain = new Map<
  string,
  { info: SupportedNetworkInfo; name: SupportedNetworkName }
>(
  Object.entries(supportedNetworks).map(([supportedNetwork, networkInfo]) => [
    networkInfo.rangoBlockchain,
    {
      info: networkInfo,
      name: supportedNetwork as unknown as SupportedNetworkName,
    },
  ]),
);

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

  rangoMeta: Readonly<{
    blockchains: ReadonlyArray<BlockchainMeta>;
    blockchainsByName: ReadonlyMap<string, BlockchainMeta>;
    tokens: ReadonlyArray<RangoToken>;
    tokensByAddress: ReadonlyMap<Lowercase<string>, RangoToken>;
    tokensByBlockchainAddress: ReadonlyMap<
      `${string}-${Lowercase<string>}`,
      RangoToken
    >;
  }>;

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
    this.rangoMeta = {
      blockchains: [],
      blockchainsByName: new Map(),
      tokens: [],
      tokensByAddress: new Map(),
      tokensByBlockchainAddress: new Map(),
    };
    this.transactionsStatus = [];
    this.swaplist = [];
    this.swaplistMap = new Map();
  }

  async init(tokenList?: TokenType[]): Promise<void> {
    logger.info(`init: Initialising against ${tokenList?.length} tokens...`);

    if (!Rango.isNetworkSupportedByEnkrypt(this.network)) {
      logger.info(
        `init: Enkrypt does not support network on Rango: ${this.network}`,
      );
      return;
    }

    const [rangoMeta, swaplist] = await Promise.all([
      rangoClient.meta({
        excludeNonPopulars: true,
        transactionTypes: [
          RangoTransactionType.EVM,
          RangoTransactionType.SOLANA,
        ],
      }),
      fetchRangoSwaplist(),
    ]);

    /** Rango blockchain id + lowercase address -> rango token meta */
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

    const rangoBlockchains = rangoMeta.blockchains;
    const rangoBlockchainsByName = new Map<string, BlockchainMeta>();
    for (let i = 0, len = rangoBlockchains.length; i < len; i++) {
      const rangoBlockchain = rangoBlockchains[i];
      rangoBlockchainsByName.set(rangoBlockchain.name, rangoBlockchain);
    }

    const rangoTokens = rangoMeta.tokens;
    const rangoTokensByAddress = new Map<Lowercase<string>, RangoToken>();
    for (let i = 0, len = rangoTokens.length; i < len; i++) {
      const rangoToken = rangoTokens[i];
      const lcAddress = (rangoToken.address?.toLowerCase() ??
        NATIVE_TOKEN_ADDRESS) as Lowercase<string>;
      rangoTokensByAddress.set(lcAddress, rangoToken);
    }
    const rangoTokensByBlockchainAddress = new Map<
      `${string}-${Lowercase<string>}`,
      RangoToken
    >();
    for (let i = 0, len = rangoTokens.length; i < len; i++) {
      const rangoToken = rangoTokens[i];
      const lcAddress = (rangoToken.address?.toLowerCase() ??
        NATIVE_TOKEN_ADDRESS) as Lowercase<string>;
      const key: `${string}-${Lowercase<string>}` = `${rangoToken.blockchain}-${lcAddress}`;
      rangoTokensByBlockchainAddress.set(key, rangoToken);
    }

    this.tokenList = tokenList ?? [];
    this.swaplist = swaplist;
    this.swaplistMap = swaplistMap;
    this.rangoMeta = {
      blockchains: rangoBlockchains,
      blockchainsByName: rangoBlockchainsByName,
      tokens: rangoTokens,
      tokensByAddress: rangoTokensByAddress,
      tokensByBlockchainAddress: rangoTokensByBlockchainAddress,
    };

    logger.info(
      "init: Rango meta" +
        `  tokens.length=${rangoMeta.tokens.length}` +
        `  blockchains.length=${rangoMeta.blockchains.length}`,
    );

    const supportedNetworkInfo = supportedNetworkInfoByName.get(this.network);

    if (!supportedNetworkInfo) {
      logger.info(
        `init: Network not supported on Enkrypt+Rango: ${this.network}`,
      );
      return;
    }

    if (
      !Rango.isNetworkSupportedByRango(supportedNetworkInfo, rangoBlockchains)
    ) {
      logger.info(`init: Network not supported on Rango: ${this.network}`);
      return;
    }

    if (tokenList) {
      // List available "from" tokens by matching between our swap list info and Rango token info, on this chain
      for (let i = 0, len = tokenList.length; i < len; i++) {
        /** Token from */
        const listToken = tokenList[i];
        const casedAddress = listToken.address;
        const lcAddress = casedAddress.toLowerCase() as Lowercase<string>;
        const key: `${string}-${Lowercase<string>}` = `${supportedNetworkInfo.rangoBlockchain}-${lcAddress}`;
        /** Token from Rango API */
        const rangoToken = rangoTokensByBlockchainAddress.get(key);
        if (this.isNativeToken(casedAddress) || rangoToken) {
          this.fromTokens[casedAddress] = listToken;
        }
      }
    }

    logger.info(`init: Finished initialising`);
  }

  static findRangoBlockchainForSupportedNetwork(
    supportedNetworkInfo: SupportedNetworkInfo,
    rangoBlockchains: ReadonlyArray<BlockchainMeta>,
  ): undefined | BlockchainMeta {
    const matchingRangoBlockchain = rangoBlockchains.find(
      (rangoBlockchain: BlockchainMeta) =>
        rangoChainIdsEq(
          rangoBlockchain.chainId,
          supportedNetworkInfo.rangoChainId,
        ),
    );

    return matchingRangoBlockchain;
  }

  static isNetworkSupportedByEnkrypt(
    supportedNetworkName: SupportedNetworkName,
  ): boolean {
    return supportedNetworkInfoByName.has(supportedNetworkName);
  }

  /**
   * Is this network supported by both enkrypt and rango?
   */
  static isNetworkSupportedByEnkryptAndRango(
    supportedNetworkName: SupportedNetworkName,
    rangoBlockchains: ReadonlyArray<BlockchainMeta>,
  ): boolean {
    const supportedNetworkInfo =
      supportedNetworkInfoByName.get(supportedNetworkName);

    // Enkrypt must support this network on Rango
    if (!supportedNetworkInfo) {
      return false;
    }

    return this.isNetworkSupportedByRango(
      supportedNetworkInfo,
      rangoBlockchains,
    );
  }

  /**
   * Is this network that *we* support also supported by rango?
   */
  static isNetworkSupportedByRango(
    supportedNetworkInfo: SupportedNetworkInfo,
    rangoBlockchains: ReadonlyArray<BlockchainMeta>,
  ): boolean {
    if (!rangoBlockchains.length) {
      // Rango didn't give us anything so just assume Rango supports this network
      // (maybe due to rango api error or something?)
      return true;
    }

    // Rango must support this network

    // Find the rango blockchain that corresponds to this enkrypt network, if exists
    const matchingRangoBlockchain = this.findRangoBlockchainForSupportedNetwork(
      supportedNetworkInfo,
      rangoBlockchains,
    );

    // Supported if
    // 1. Rango supports this chain and
    // 2. Rango is enabled on this chain
    return matchingRangoBlockchain?.enabled ?? false;
  }

  getFromTokens(): ProviderFromTokenResponse {
    return this.fromTokens;
  }

  getToTokens(): ProviderToTokenResponse {
    const { tokens } = this.rangoMeta;

    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const supportedNetwork = supportedNetworkByRangoBlockchain.get(
        token.blockchain,
      );

      // Unrecognised network (Rango supports it but we don't)
      if (!supportedNetwork) continue;

      const address = token.address || NATIVE_TOKEN_ADDRESS;
      const lcaddress = address.toLowerCase() as Lowercase<string>;
      const key: `${string}-${Lowercase<string>}` = `${token.blockchain}-${lcaddress}`;
      const swaplistToken = this.swaplistMap.get(key);

      let type: NetworkType;
      switch (supportedNetwork.name) {
        case SupportedNetworkName.Solana:
          type = NetworkType.Solana;
          break;
        default:
          type = NetworkType.EVM;
          break;
      }

      const toToken: TokenTypeTo = {
        ...token,
        address,
        name: token.name || token.symbol,
        logoURI: token.image,
        type,
        price: token.usdPrice,
        cgId: swaplistToken?.token?.cgId,
        symbol: token.symbol,
        decimals: token.decimals,
        balance: undefined,
        rank: swaplistToken?.token?.rank,
        networkInfo: {
          name: supportedNetwork.name,
          isAddress: getIsAddressAsync(supportedNetwork.name),
        },
      };

      this.toTokens[supportedNetwork.name] ??= {};
      this.toTokens[supportedNetwork.name][address] = toToken;
    }

    return this.toTokens;
  }

  /**
   * Returns the symbol in Rango's specific form from the meta information.
   * For cross-chain tokens like Ethereum (ETH) on the Binance Smart Chain (BSC) network,
   * it returns the corresponding symbol like WETH.
   */
  private getRangoTokenSymbol(
    token: TokenType,
    rangoBlockchain: BlockchainMeta,
  ): string | undefined {
    const { tokensByBlockchainAddress } = this.rangoMeta;
    if (this.isNativeToken(token.address)) return token.symbol;
    if (token.address == null) {
      console.warn(
        `Cannot get Rango token symbol: Token address is not defined` +
          ` for token ${token.name} (${token.symbol}) - ${token.address}`,
      );
      return undefined;
    }
    const lcAddress = token.address.toLowerCase() as Lowercase<string>;
    const key: `${string}-${Lowercase<string>}` = `${rangoBlockchain.name}-${lcAddress}`;
    return tokensByBlockchainAddress.get(key)?.symbol;
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
    abortable?: { signal?: AbortSignal },
  ): Promise<RangoSwapResponse | null> {
    const { blockchains } = this.rangoMeta;
    const startedAt = Date.now();

    logger.info(
      `getRangoSwap: Getting swap` +
        `  fromNetwork=${this.network}` +
        `  toNetwork=${options.toToken.networkInfo.name}` +
        `  fromToken=${options.fromToken.symbol}` +
        `  toToken=${options.toToken.symbol}` +
        `  fromAddress=${options.fromAddress}` +
        `  toAddress=${options.toAddress}`,
    );

    try {
      // Determine whether Enkrypt + Rango supports this swap
      abortable?.signal?.throwIfAborted();

      // We must support Rango on the source network
      // (note: probably redundant since we should always support rango on the source network if we got this far)
      const fromNetworkInfo = supportedNetworkInfoByName.get(this.network);
      if (!fromNetworkInfo) {
        logger.info(
          "getRangoSwap: No swap:" +
            ` Enkrypt does not support Rango swap on the source network` +
            `  fromNetwork=${this.network}`,
        );
        return null;
      }

      // We must support Rango on the destination network
      const toNetworkInfo = supportedNetworkInfoByName.get(
        options.toToken.networkInfo.name as SupportedNetworkName,
      );
      if (!toNetworkInfo) {
        logger.info(
          "getRangoSwap: No swap:" +
            ` Enkrypt does not support Rango swap on the destination network` +
            `  fromNetwork=${this.network}`,
        );
        return null;
      }

      // Rango must support the source network
      const fromRangoBlockchain = Rango.findRangoBlockchainForSupportedNetwork(
        fromNetworkInfo,
        blockchains,
      );
      if (!fromRangoBlockchain?.enabled) {
        logger.info(
          `getRangoSwap: No swap:` +
            ` Rango does not support swap on the source network` +
            `  fromNetwork=${this.network}` +
            `  fromBlockchain=${fromRangoBlockchain.name}` +
            `  enabled=${fromRangoBlockchain.enabled}`,
        );
        return null;
      }
      const fromRangoBlockchainName = fromRangoBlockchain.name;

      // Rango must support the destination network
      const toRangoBlockchain = Rango.findRangoBlockchainForSupportedNetwork(
        toNetworkInfo,
        blockchains,
      );
      if (!toRangoBlockchain?.enabled) {
        logger.info(
          `getRangoSwap: No swap:` +
            ` Rango does not support swap on the destination network` +
            `  toNetwork=${options.toToken.networkInfo.name}` +
            `  toBlockchain=${toRangoBlockchain.name}` +
            `  enabled=${toRangoBlockchain.enabled}`,
        );
        return null;
      }
      const toRangoBlockchainName = toRangoBlockchain.name;

      // Does Rango support these tokens?
      const feeConfig = FEE_CONFIGS[this.name][meta.walletIdentifier];

      logger.info(
        `getRangoSwap: Rango block chains ids` +
          `  fromRangoBlockchain=${fromRangoBlockchainName}` +
          `  toRangoBlockchain=${toRangoBlockchainName}`,
      );

      const fromTokenAddress = options.fromToken.address;
      const toTokenAddress = options.toToken.address;

      /** Source token symbol */
      const fromRangoTokenSymbol = this.getRangoTokenSymbol(
        options.fromToken,
        fromRangoBlockchain,
      );

      /** Destination token symbol */
      const toRangoTokenSymbol = this.getRangoTokenSymbol(
        options.toToken,
        toRangoBlockchain,
      );

      // If we can't get symbols for the tokens then we don't support them
      if (!fromRangoTokenSymbol || !toRangoTokenSymbol) {
        logger.info(
          `getRangoSwap: No swap: No symbol for src token or dst token` +
            `  fromTokenSymbol=${fromRangoTokenSymbol}` +
            `  toTokenSymbol=${toRangoTokenSymbol}`,
        );
        return null;
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
          blockchain: fromRangoBlockchainName,
          symbol: fromRangoTokenSymbol,
        },
        to: {
          address: !this.isNativeToken(toTokenAddress) ? toTokenAddress : null,
          blockchain: toRangoBlockchainName,
          symbol: toRangoTokenSymbol,
        },
        amount: options.amount.toString(),
        fromAddress: options.fromAddress,
        toAddress: options.toAddress,
        slippage,
        referrerFee: feeConfig ? (feeConfig.fee * 100).toFixed(3) : undefined,
        referrerAddress: feeConfig?.referrer || undefined,
        disableEstimate: true,
      };

      logger.info(
        `getRangoSwap: Requesting quote from rango sdk...` +
          `  fromRangoBlockchain=${fromRangoBlockchainName}` +
          `  toRangoBlockchain=${toRangoBlockchainName}` +
          `  fromToken=${fromRangoTokenSymbol}` +
          `  toToken=${toRangoTokenSymbol}` +
          `  fromAddress=${options.fromAddress}` +
          `  toAddress=${options.toAddress}` +
          `  amount=${options.amount.toString()}` +
          `  slippage=${slippage}` +
          `  referrerFee=${params.referrerFee}`,
      );
      const rangoSwapResponse = await rangoClient.swap(params, abortable);
      logger.info(`getRangoSwap: Received quote from rango sdk`);

      abortable?.signal?.throwIfAborted();

      if (
        rangoSwapResponse.error ||
        rangoSwapResponse.resultType !== RoutingResultType.OK
      ) {
        // Rango experienced some kind of error or is unable to route the swap
        logger.info(`getRangoSwap: Rango swap SDK returned an error`);
        console.error("Rango swap SDK error:", rangoSwapResponse.error);
        return null;
      }

      logger.info(`getRangoSwap: Rango swap SDK returned OK`);

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

      logger.info(
        `getRangoSwap: Additional non-network source fees ${additionalNativeFees.toString()}`,
      );

      // Fill in gas values, add approval transactions, etc
      let networkTransactions: RangoNetworkedTransactions;

      switch (rangoSwapResponse.tx?.type) {
        // Process Rango swap EVM transaction
        case RangoTransactionType.EVM: {
          logger.info(`getRangoSwap: Received EVM transaction`);

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
              this.network,
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
          logger.info("getRangoSwap: Received Solana transaction");

          let enkSolTx: SolanaTransaction;
          switch (rangoSwapResponse.tx.txType) {
            case "LEGACY": {
              let legacyTx: SolanaLegacyTransaction;
              if (rangoSwapResponse.tx.serializedMessage) {
                logger.info(
                  `getRangoSwap: Deserializing Solana legacy unsigned transaction`,
                );
                // Legacy transaction, not signed (we can modify it)
                // > When serialized message appears, there is no need for other fields and you just sign and send it
                // @see (2024-09-17) https://docs.rango.exchange/api-integration/main-api-multi-step/sample-transactions#solana-sample-transaction-test
                legacyTx = SolanaLegacyTransaction.from(
                  rangoSwapResponse.tx.serializedMessage,
                );
              } else {
                logger.info(
                  `getRangoSwap: Constructing Solana legacy signed transaction`,
                );
                // Legacy transaction signed by Rango, we cannot alter this transaction
                // Since the recent block hash gets signed too, this transaction will need to be consumed quickly
                const msg = extractTransactionMessageFromSignedRangoTransaction(
                  rangoSwapResponse.tx,
                );
                legacyTx = SolanaLegacyTransaction.populate(
                  msg.compileToLegacyMessage(),
                );
              }

              logger.info(
                "getRangoSwap: Extracting third party Rango signatures...",
              );
              const thirdPartySignatures =
                extractSignaturesFromRangoTransaction(rangoSwapResponse.tx);

              // Verify Rango signatures incase rango gives us invalid transaction signatures
              logger.info("getRangoSwap: Checking Rango signatures...");
              const signaturesAreValid = checkSolanaLegacyTransactionSignatures(
                legacyTx,
                thirdPartySignatures,
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
                    sig.signature,
                  ).toString("hex")}`;
                }
                warnMsg += `  fromRangoBlockchain=${fromRangoBlockchainName}`;
                warnMsg += `  toRangoBlockchain=${toRangoBlockchainName}`;
                warnMsg += `  fromToken=${fromRangoTokenSymbol}`;
                warnMsg += `  toToken=${toRangoTokenSymbol}`;
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
              logger.info("getRangoSwap: Simulating transaction...");
              const statusResult =
                await checkExpectedSolanaLegacyTransactionStatus(
                  conn,
                  legacyTx,
                  thirdPartySignatures.length > 0,
                  abortable,
                );
              if (!statusResult.succeeds) {
                let warnMsg = `Failed to simulate Rango Solana`;
                if (thirdPartySignatures.length > 0) warnMsg += ` signed`;
                else warnMsg += ` unsigned`;
                warnMsg += ` legacy transaction,`;
                warnMsg += ` dropping Rango swap transaction`;
                warnMsg += `  fromRangoBlockchain=${fromRangoBlockchainName}`;
                warnMsg += `  toRangoBlockchain=${toRangoBlockchainName}`;
                warnMsg += `  fromToken=${fromRangoTokenSymbol}`;
                warnMsg += `  toToken=${toRangoTokenSymbol}`;
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
                logger.info(
                  `getRangoSwap: Deserializing Solana versioned unsigned transaction`,
                );
                // Versioned transaction, not signed (we can modify it)
                // > When serialized message appears, there is no need for other fields and you just sign and send it
                // @see (2024-09-17) https://docs.rango.exchange/api-integration/main-api-multi-step/sample-transactions#solana-sample-transaction-test
                const bytes = new Uint8Array(
                  rangoSwapResponse.tx.serializedMessage,
                );
                versionedTx = VersionedTransaction.deserialize(bytes);
              } else {
                logger.info(
                  `getRangoSwap: Constructing Solana versioned signed transaction`,
                );
                // Versioned transaction signed by Rango, we cannot alter this transaction
                // Since the recent block hash gets signed too, this transaction will need to be consumed quickly
                const msg = extractTransactionMessageFromSignedRangoTransaction(
                  rangoSwapResponse.tx,
                );
                versionedTx = new VersionedTransaction(
                  msg.compileToV0Message(),
                );
              }

              logger.info(
                "getRangoSwap: Extracting third party Rango signatures...",
              );
              const thirdPartySignatures =
                extractSignaturesFromRangoTransaction(rangoSwapResponse.tx);

              // Verify Rango signatures incase rango gives us invalid transaction signatures
              logger.info(
                `getRangoSwap: Checking Rango signatures...` +
                  `  signatures=${thirdPartySignatures.length}`,
                `  pubkeys=${thirdPartySignatures
                  .map(({ pubkey }) => pubkey)
                  .join(",")}`,
              );
              const signaturesAreValid =
                checkSolanaVersionedTransactionSignatures(
                  versionedTx,
                  thirdPartySignatures,
                );
              if (!signaturesAreValid) {
                let warnMsg = `Rango Solana signed versioned transaction has invalid Rango signatures,`;
                warnMsg += `  dropping Rango swap transaction`;
                for (
                  let tpsigi = 0, tpsiglen = thirdPartySignatures.length;
                  tpsigi < tpsiglen;
                  tpsigi++
                ) {
                  const sig = thirdPartySignatures[tpsigi];
                  warnMsg += `  sig[${tpsigi}].pubkey=${sig.pubkey}`;
                  warnMsg += `  sig[${tpsigi}].signature=0x${Buffer.from(
                    sig.signature,
                  ).toString("hex")}`;
                }
                warnMsg += `  fromRangoBlockchain=${fromRangoBlockchainName}`;
                warnMsg += `  toRangoBlockchain=${toRangoBlockchainName}`;
                warnMsg += `  fromToken=${fromRangoTokenSymbol}`;
                warnMsg += `  toToken=${toRangoTokenSymbol}`;
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
              logger.info("getRangoSwap: Simulating transaction...");
              const statusResult =
                await checkExpectedSolanaVersionedTransactionStatus(
                  conn,
                  versionedTx,
                  thirdPartySignatures.length > 0,
                  abortable,
                );
              if (!statusResult.succeeds) {
                let warnMsg = `Failed to simulate Rango Solana`;
                if (thirdPartySignatures.length > 0) warnMsg += ` signed`;
                else warnMsg += ` unsigned`;
                warnMsg += ` versioned transaction,`;
                warnMsg += ` dropping Rango swap transaction`;
                warnMsg += `  fromRangoBlockchain=${fromRangoBlockchainName}`;
                warnMsg += `  toRangoBlockchain=${toRangoBlockchainName}`;
                warnMsg += `  fromToken=${fromRangoTokenSymbol}`;
                warnMsg += `  toToken=${toRangoTokenSymbol}`;
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
                kind: "versioned",
                serialized: Buffer.from(versionedTx.serialize()).toString(
                  "base64",
                ),
                thirdPartySignatures,
              };
              break;
            }
            default:
              rangoSwapResponse.tx.txType satisfies never;
              throw new Error(
                `Unhandled Rango Solana transaction type: ${rangoSwapResponse.tx.txType}`,
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
            `Unhandled Rango transaction type: ${rangoSwapResponse.tx.type}`,
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

      logger.info(
        `getRangoSwap: Done  took=${(Date.now() - startedAt).toLocaleString()}ms`,
      );

      return result;
    } catch (err) {
      if (!abortable?.signal?.aborted) {
        console.error(
          `Error getting Rango swap, returning empty response (no swap)`,
          err,
        );
      }
      return null;
    }
  }

  async getQuote(
    options: getQuoteOptions,
    meta: QuoteMetaOptions,
    abortable?: { signal: AbortSignal },
  ): Promise<ProviderQuoteResponse | null> {
    const res = await this.getRangoSwap(options, meta, false, abortable);
    if (!res) return null;

    let totalGaslimit: number;
    switch (res.networkTransactions.type) {
      case NetworkType.EVM: {
        totalGaslimit = res.networkTransactions.transactions.reduce(
          (total: number, curVal: EVMTransaction) =>
            total + toBN(curVal.gasLimit).toNumber(),
          0,
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
              Buffer.from(tx.serialized, "base64"),
            ),
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
    abortable?: { signal: AbortSignal },
  ): Promise<ProviderSwapResponse | null> {
    const res = await this.getRangoSwap(
      quote.options,
      quote.meta,
      true,
      abortable,
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
        options: StatusOptions,
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
    const { requestId, transactions } = options;

    // TODO: If a Solana transaction hasn't been found after 3 minutes then consider dropping it
    // I'm not sure how Rango's API handles Solana transactions being dropped...

    const mostRecentTransactionHash =
      transactions.length > 0
        ? transactions[transactions.length - 1].hash
        : transactions[0].hash;

    const isAlreadySuccessOrFailed = [
      RangoTransactionStatus.FAILED,
      RangoTransactionStatus.SUCCESS,
    ].includes(
      this.transactionsStatus.find((t) => t.hash === mostRecentTransactionHash)
        ?.status,
    );

    if (requestId && !isAlreadySuccessOrFailed) {
      const res = await rangoClient.status({
        txId: mostRecentTransactionHash,
        requestId,
      });

      if (res.error || res.status === RangoTransactionStatus.FAILED) {
        this.transactionsStatus.push({
          status: RangoTransactionStatus.FAILED,
          hash: mostRecentTransactionHash,
        });
        return TransactionStatus.failed;
      }
      if (!res.status || res.status === RangoTransactionStatus.RUNNING) {
        return TransactionStatus.pending;
      }
      this.transactionsStatus.push({
        status: RangoTransactionStatus.SUCCESS,
        hash: mostRecentTransactionHash,
      });
      return TransactionStatus.success;
    }

    const statuses: TransactionStatus[] = [];
    switch (this.network) {
      case SupportedNetworkName.Solana: {
        // Get status of Solana transactions
        const sigStatuses = await (
          this.web3 as Connection
        ).getSignatureStatuses(transactions.map(({ hash }) => hash));
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
          transactions.map(({ hash }) =>
            (this.web3 as Web3Eth).getTransactionReceipt(hash),
          ),
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
  network: SupportedNetworkName,
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
  abortable?: { signal?: AbortSignal },
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
          ` retries: ${String(errref?.err ?? "???")}`,
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
          .catch(
            (err: Error) => `! Failed to decode response text: ${String(err)}`,
          );
        const len = msg.length;
        if (len > 512 + 10 + len.toString().length)
          msg = `${msg.slice(0, 512)}... (512/${len})`;
        throw new Error(
          `Failed to fetch Rango swaplists with ${res.status} ${res.statusText} ${url} ${msg}`,
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
  rangoSolanaTx: RangoSolanaTransaction,
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
  rangoSolanaTx: RangoSolanaTransaction,
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
  }[],
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
      Buffer.from(sig.signature),
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
  }[],
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
        Buffer.from(sig.signature),
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
  abortable?: { signal?: AbortSignal },
): Promise<
  | { succeeds: true; error?: undefined }
  | { succeeds: false; error: TransactionError }
> {
  const retries = [0, 500, 1_000, 2_000];
  let retryidx = 0;
  let errref: undefined | { txerr: TransactionError };
  let success = false;
  while (!success) {
    abortable?.signal?.throwIfAborted();
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
      logger.info(
        `checkExpectedSolanaLegacyTransactionStatus: Retrying Rango Solana unsigned legacy transaction simulation` +
          ` with updated block hash ${latestBlockHash.blockhash}...`,
      );
      legacyTx.recentBlockhash = latestBlockHash.blockhash;
      abortable?.signal?.throwIfAborted();
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
  abortable?: { signal?: AbortSignal },
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
      logger.info(
        `checkExpectedSolanaVersionedTransactionStatus: Retrying Rango Solana unsigned versioned transaction simulation` +
          ` with updated block hash ${latestBlockHash.blockhash}...`,
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
