import { SignerType } from "@enkryptcom/types";
import { NetworkInfo, NetworkType, SupportedNetworkName } from "../types";

/**
 * Sometimes you can get decimals and token info from here `https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/dist/master-file.json`
 */
const NetworkDetails: Record<SupportedNetworkName, NetworkInfo> = {
  [SupportedNetworkName.Bitcoin]: {
    id: SupportedNetworkName.Bitcoin,
    decimals: 8,
    logoURI: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
    name: "Bitcoin",
    symbol: "BTC",
    cgId: "bitcoin",
    rank: 1,
    signerType: [SignerType.secp256k1btc],
    type: NetworkType.Bitcoin,
  },
  [SupportedNetworkName.Ethereum]: {
    id: SupportedNetworkName.Ethereum,
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "Ethereum",
    symbol: "ETH",
    rank: 2,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },

  [SupportedNetworkName.Binance]: {
    id: SupportedNetworkName.Binance,
    cgId: "binancecoin",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png",
    name: "BNB",
    symbol: "BNB",
    rank: 3,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Matic]: {
    id: SupportedNetworkName.Matic,
    cgId: "matic-network",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
    name: "Polygon",
    symbol: "MATIC",
    rank: 4,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.MaticZK]: {
    id: SupportedNetworkName.MaticZK,
    cgId: "matic-network",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
    name: "Polygon ZK",
    symbol: "MATIC",
    rank: 4,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Optimism]: {
    id: SupportedNetworkName.Optimism,
    cgId: "optimism",
    decimals: 18,
    logoURI:
      "https://assets.coingecko.com/coins/images/25244/large/Optimism.png",
    name: "Optimism",
    symbol: "ETH",
    rank: 5,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Base]: {
    id: SupportedNetworkName.Base,
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://assets.coingecko.com/asset_platforms/images/131/large/base.jpeg",
    name: "Base",
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
    rank: 6,
    symbol: "ETH",
  },
  [SupportedNetworkName.Arbitrum]: {
    id: SupportedNetworkName.Arbitrum,
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg",
    name: "Arbitrum",
    symbol: "ETH",
    rank: 6,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Gnosis]: {
    id: SupportedNetworkName.Gnosis,
    cgId: "dai",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
    name: "Gnosis",
    symbol: "xDAI",
    rank: 7,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Avalanche]: {
    id: SupportedNetworkName.Avalanche,
    cgId: "avalanche-2",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7.png",
    name: "Avalanche",
    symbol: "AVAX",
    rank: 8,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Fantom]: {
    id: SupportedNetworkName.Fantom,
    cgId: "fantom",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0x4e15361fd6b4bb609fa63c81a2be19d873717870.png",
    name: "Fantom",
    symbol: "FTM",
    rank: 9,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Kaia]: {
    id: SupportedNetworkName.Kaia,
    cgId: "kaia",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xe4f05a66ec68b54a58b17c22107b02e0232cc817.png",
    name: "Kaia",
    symbol: "KAIA",
    rank: 10,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Moonbeam]: {
    id: SupportedNetworkName.Moonbeam,
    cgId: "moonbeam",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/22459/thumb/glmr.png",
    name: "Moonbeam",
    symbol: "GLMR",
    rank: 11,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Kusama]: {
    id: SupportedNetworkName.Kusama,
    decimals: 12,
    logoURI:
      "https://assets.coingecko.com/coins/images/9568/thumb/m4zRhP5e_400x400.jpg",
    name: "Kusama",
    symbol: "ksm",
    cgId: "kusama",
    rank: 12,
    signerType: [SignerType.sr25519, SignerType.ed25519],
    type: NetworkType.Substrate,
  },
  [SupportedNetworkName.Polkadot]: {
    id: SupportedNetworkName.Polkadot,
    decimals: 10,
    logoURI:
      "https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png",
    name: "Polkadot",
    symbol: "DOT",
    cgId: "polkadot",
    rank: 13,
    signerType: [SignerType.sr25519, SignerType.ed25519],
    type: NetworkType.Substrate,
  },
  [SupportedNetworkName.EthereumClassic]: {
    id: SupportedNetworkName.EthereumClassic,
    cgId: "ethereum-classic",
    decimals: 18,
    logoURI:
      "https://assets.coingecko.com/coins/images/453/thumb/ethereum-classic-logo.png",
    name: "Ethereum Classic",
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
    rank: 14,
    symbol: "ETC",
  },
  [SupportedNetworkName.Aurora]: {
    id: SupportedNetworkName.Aurora,
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://assets.coingecko.com/coins/images/20582/large/aurora.jpeg",
    name: "Aurora",
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
    rank: 15,
    symbol: "ETH",
  },
  [SupportedNetworkName.Zksync]: {
    id: SupportedNetworkName.Zksync,
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "ZkSync Era",
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
    rank: 16,
    symbol: "ETH",
  },
  [SupportedNetworkName.Litecoin]: {
    id: SupportedNetworkName.Litecoin,
    decimals: 8,
    logoURI: "https://assets.coingecko.com/coins/images/2/thumb/litecoin.png",
    name: "Litecoin",
    symbol: "LTC",
    cgId: "litecoin",
    rank: 17,
    signerType: [SignerType.secp256k1btc],
    type: NetworkType.Bitcoin,
  },
  [SupportedNetworkName.Dogecoin]: {
    id: SupportedNetworkName.Dogecoin,
    decimals: 8,
    logoURI: "https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png",
    name: "Dogecoin",
    symbol: "DOGE",
    cgId: "dogecoin",
    rank: 18,
    signerType: [SignerType.secp256k1btc],
    type: NetworkType.Bitcoin,
  },
  [SupportedNetworkName.Solana]: {
    id: SupportedNetworkName.Solana,
    decimals: 9,
    logoURI:
      "https://assets.coingecko.com/coins/images/4128/standard/solana.png",
    name: "Solana",
    symbol: "SOL",
    cgId: "solana",
    rank: 19,
    signerType: [SignerType.ed25519sol],
    type: NetworkType.Solana,
  },
  [SupportedNetworkName.Rootstock]: {
    id: SupportedNetworkName.Rootstock,
    decimals: 18,
    logoURI:
      "https://coin-images.coingecko.com/coins/images/5070/large/RBTC-logo.png?1718152038",
    name: "Rootstock",
    symbol: "RBTC",
    cgId: "rootstock",
    rank: 19,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Blast]: {
    id: SupportedNetworkName.Blast,
    decimals: 18,
    logoURI:
      "https://assets.coingecko.com/coins/images/35494/standard/Blast.jpg",
    name: "Blast",
    symbol: "ETH",
    cgId: "ethereum",
    rank: 20,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Telos]: {
    id: SupportedNetworkName.Telos,
    decimals: 18,
    logoURI:
      "https://assets.coingecko.com/coins/images/7588/standard/tlos_png.png",
    name: "Telos",
    symbol: "TLOS",
    cgId: "telos",
    rank: 21,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
};
export const isSupportedNetwork = (networkName: SupportedNetworkName) =>
  !!NetworkDetails[networkName];

export const getSupportedNetworks = () => Object.values(NetworkDetails);

export const getNetworkInfoByName = (networkName: SupportedNetworkName) =>
  NetworkDetails[networkName];

export default NetworkDetails;
