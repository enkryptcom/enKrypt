import { NetworkInfo, SupportedNetworkName } from "../types";

const NetworkDetails: {
  [key in SupportedNetworkName]: NetworkInfo;
} = {
  [SupportedNetworkName.Bitcoin]: {
    decimals: 8,
    logoURI: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
    name: "Bitcoin",
    symbol: "BTC",
    cgId: "bitcoin",
    rank: 0,
  },
  [SupportedNetworkName.Ethereum]: {
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "Ethereum",
    symbol: "ETH",
    rank: 1,
  },
  [SupportedNetworkName.Binance]: {
    cgId: "binancecoin",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c_1.png",
    name: "BNB",
    symbol: "BNB",
    rank: 2,
  },
  [SupportedNetworkName.Matic]: {
    cgId: "matic-network",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
    name: "MATIC",
    symbol: "MATIC",
    rank: 3,
  },
  [SupportedNetworkName.Optimism]: {
    cgId: "optimism",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "Ethereum",
    symbol: "ETH",
    rank: 4,
  },
  [SupportedNetworkName.Arbitrum]: {
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "Ethereum",
    symbol: "ETH",
    rank: 5,
  },
  [SupportedNetworkName.Gnosis]: {
    cgId: "dai",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
    name: "xDAI",
    symbol: "xDAI",
    rank: 6,
  },
  [SupportedNetworkName.Avalanche]: {
    cgId: "avalanche-2",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7.png",
    name: "Avalanche",
    symbol: "AVAX",
    rank: 7,
  },
  [SupportedNetworkName.Fantom]: {
    cgId: "fantom",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0x4e15361fd6b4bb609fa63c81a2be19d873717870.png",
    name: "Fantom Token",
    symbol: "FTM",
    rank: 8,
  },
  [SupportedNetworkName.Klaytn]: {
    cgId: "klay-token",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xe4f05a66ec68b54a58b17c22107b02e0232cc817.png",
    name: "Klaytn",
    symbol: "KLAY",
    rank: 9,
  },
  [SupportedNetworkName.Klaytn]: {
    cgId: "ethereum",
    decimals: 18,
    logoURI:
      "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "Ethereum",
    symbol: "ETH",
    rank: 10,
  },
  [SupportedNetworkName.Moonbeam]: {
    cgId: "moonbeam",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/22459/thumb/glmr.png",
    name: "Moonbeam",
    symbol: "GLMR",
    rank: 11,
  },
  [SupportedNetworkName.Kusama]: {
    decimals: 12,
    logoURI:
      "https://assets.coingecko.com/coins/images/9568/thumb/m4zRhP5e_400x400.jpg",
    name: "Kusama",
    symbol: "ksm",
    cgId: "kusama",
    rank: 12,
  },
  [SupportedNetworkName.Polkadot]: {
    decimals: 10,
    logoURI:
      "https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png",
    name: "Polkadot",
    symbol: "DOT",
    cgId: "polkadot",
    rank: 13,
  },
};

export default NetworkDetails;
