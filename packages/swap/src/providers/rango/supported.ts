import { SupportedNetworkName } from "../../types";

export type SupportedNetworkInfo = {
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
  [SupportedNetworkName.Base]: {
    realChainId: "8453",
    rangoChainId: "8453",
    rangoBlockchain: "BASE",
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
export const supportedNetworkInfoByName = new Map(
  Object.entries(supportedNetworks),
) as unknown as Map<SupportedNetworkName, SupportedNetworkInfo>;

/** Rango blockchain name -> network info & enkrypt network name */
export const supportedNetworkByRangoBlockchain = new Map<
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
