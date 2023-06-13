import { NetworkNames } from "@enkryptcom/types";
import { isAddress, toBN } from "web3-utils";
import { NetworkType, TokenType, TokenTypeTo } from "../../../src/types";

const amount = toBN("10000000000000000000");

const fromAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const toAddress = "0x255d4D554325568A2e628A1E93120EbA1157C07e";
const nodeURL = "https://nodes.mewapi.io/rpc/eth";
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
  address: "0x111111111117dc0aa78b770fa6a738034120c302",
  decimals: 18,
  logoURI:
    "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028",
  name: "1inch",
  symbol: "1INCH",
  rank: 100,
  cgId: "1inch",
  type: NetworkType.EVM,
  networkInfo: {
    isAddress: async (address: string) => isAddress(address),
    name: NetworkNames.Ethereum,
  },
};

export {
  fromToken,
  toToken,
  toTokenWETH,
  amount,
  fromAddress,
  toAddress,
  nodeURL,
};
