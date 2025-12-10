import { NetworkNames } from "@enkryptcom/types";
import { isAddress, toBN } from "web3-utils";
import { NetworkType, TokenType, TokenTypeTo } from "../../../src/types";

const amount = toBN("100000000000000000000"); // DAI, $100, 18 decimals
const amountUSDT = toBN("100000000"); // USDT, $100, 6 decimals

const fromAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const zeroxFromAddress = "0x8A610c1C93da88c59F51A6264A4c70927814B320"; //random user address
const toAddress = "0x255d4D554325568A2e628A1E93120EbA1157C07e";
const nodeURL = "https://nodes.mewapi.io/rpc/eth";
const nodeURLMatic = "https://nodes.mewapi.io/rpc/matic";

const fromTokenNative: TokenType = {
  address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  decimals: 18,
  logoURI: "",
  name: "Matic",
  symbol: "MATIC",
  rank: 18,
  cgId: "",
  type: NetworkType.EVM,
};

const fromToken: TokenType = {
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  decimals: 18,
  logoURI:
    "https://assets.coingecko.com/coins/images/9956/thumb/4943.png?1636636734",
  name: "Dai",
  symbol: "DAI",
  rank: 18,
  cgId: "dai",
  type: NetworkType.EVM,
};

const fromTokenUSDT: TokenType = {
  address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  decimals: 6,
  logoURI:
    "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
  name: "Tether",
  symbol: "USDT",
  rank: 18,
  cgId: "tether",
  type: NetworkType.EVM,
};

const fromTokenWBTC: TokenType = {
  address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  decimals: 8,
  logoURI: "https://api.rango.exchange/tokens/ETH/WBTC.png",
  name: "WBTC",
  symbol: "WBTC",
  rank: 18,
  cgId: "bitcoin",
  type: NetworkType.EVM,
};

const toTokenWETH: TokenTypeTo = {
  address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  decimals: 18,
  logoURI:
    "https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1628852295",
  name: "WETH",
  symbol: "WETH",
  rank: 100,
  cgId: "ethereum",
  type: NetworkType.EVM,
  networkInfo: {
    isAddress: async (address: string) => isAddress(address),
    name: NetworkNames.Ethereum,
  },
};

const toToken: TokenTypeTo = {
  address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  decimals: 6,
  logoURI:
    "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389",
  name: "USDC",
  symbol: "usdc",
  rank: 100,
  cgId: "usdc",
  type: NetworkType.EVM,
  networkInfo: {
    isAddress: async (address: string) => isAddress(address),
    name: NetworkNames.Ethereum,
  },
};

export {
  fromToken,
  fromTokenUSDT,
  toToken,
  toTokenWETH,
  fromTokenWBTC,
  amount,
  amountUSDT,
  fromAddress,
  toAddress,
  nodeURL,
  nodeURLMatic,
  fromTokenNative,
  zeroxFromAddress,
};
