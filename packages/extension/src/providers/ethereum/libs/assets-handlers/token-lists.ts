import cacheFetch from "@/libs/cache-fetch";
import { NetworkNames } from "@enkryptcom/types";
import { CGToken, SupportedNetworkNames } from "./types/tokenbalance-mew";
const TOKEN_FETCH_TTL = 1000 * 60 * 60;
const TokenList: Record<SupportedNetworkNames, string> = {
  [NetworkNames.Binance]:
    "https://tokens.coingecko.com/binance-smart-chain/all.json",
  [NetworkNames.Ethereum]: "https://tokens.coingecko.com/ethereum/all.json",
  [NetworkNames.Matic]: "https://tokens.coingecko.com/polygon-pos/all.json",
  [NetworkNames.AstarEVM]: "https://tokens.coingecko.com/astar/all.json",
  [NetworkNames.Okc]: "https://tokens.coingecko.com/okex-chain/all.json",
  [NetworkNames.Optimism]:
    "https://tokens.coingecko.com/optimistic-ethereum/all.json",
  [NetworkNames.Moonriver]: "https://tokens.coingecko.com/moonriver/all.json",
  [NetworkNames.Moonbeam]: "https://tokens.coingecko.com/moonbeam/all.json",
  [NetworkNames.ShidenEVM]:
    "https://tokens.coingecko.com/shiden%20network/all.json",
  [NetworkNames.Canto]: "https://tokens.coingecko.com/canto/all.json",
  [NetworkNames.Rootstock]:
    "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/rsk.json",
  [NetworkNames.ZkSyncGoerli]:
    "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/zksyncgoerli.json",
  [NetworkNames.ZkSync]:
    "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/zksync.json",
};

const getKnownNetworkTokens = async (
  networkName: NetworkNames
): Promise<Record<string, CGToken>> => {
  if (!TokenList[networkName as SupportedNetworkNames]) return {};
  return cacheFetch(
    {
      url: TokenList[networkName as SupportedNetworkNames],
    },
    TOKEN_FETCH_TTL
  ).then((json) => {
    const tokens: CGToken[] = json.tokens;
    const tObject: Record<string, CGToken> = {};
    tokens.forEach((t) => {
      tObject[t.address] = t;
    });
    return tObject;
  });
};
export { TokenList, getKnownNetworkTokens };
