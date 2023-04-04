import { SignerType } from "@enkryptcom/types";
import { NetworkInfo, NetworkType, SupportedNetworkName } from "../types";

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
      "https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c_1.png",
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
  [SupportedNetworkName.Optimism]: {
    id: SupportedNetworkName.Optimism,
    cgId: "optimism",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "Optimism",
    symbol: "ETH",
    rank: 5,
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
  },
  [SupportedNetworkName.Arbitrum]: {
    id: SupportedNetworkName.Arbitrum,
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
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
  [SupportedNetworkName.Klaytn]: {
    id: SupportedNetworkName.Klaytn,
    cgId: "klay-token",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xe4f05a66ec68b54a58b17c22107b02e0232cc817.png",
    name: "Klaytn",
    symbol: "KLAY",
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
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "Ethereum",
    signerType: [SignerType.secp256k1],
    type: NetworkType.EVM,
    rank: 15,
    symbol: "ETH",
  },
};
export const isSupportedNetwork = (networkName: SupportedNetworkName) =>
  !!NetworkDetails[networkName];

export const getSupportedNetworks = () => Object.values(NetworkDetails);

export const getNetworkInfoByName = (networkName: SupportedNetworkName) =>
  NetworkDetails[networkName];

export default NetworkDetails;
