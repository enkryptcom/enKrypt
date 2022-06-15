import { NetworkNames } from "@enkryptcom/types";
import { SupportedNetworkNames } from "./types/tokenbalance-mew";
const tokenList: Record<SupportedNetworkNames, string> = {
  [NetworkNames.Binance]:
    "https://tokens.coingecko.com/binance-smart-chain/all.json",
  [NetworkNames.Ethereum]: "https://tokens.coingecko.com/ethereum/all.json",
  [NetworkNames.Matic]: "https://tokens.coingecko.com/polygon-pos/all.json",
};

export default tokenList;
