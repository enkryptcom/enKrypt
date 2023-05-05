import cacheFetch from "@/libs/cache-fetch";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { CGToken, SupportedNetworkNames } from "./types/tokenbalance-mew";
const TOKEN_FETCH_TTL = 1000 * 60 * 60;
const TokenList: Record<SupportedNetworkNames, string> = {
  [NetworkNames.Binance]: `https://tokens.coingecko.com/${CoingeckoPlatform.Binance}/all.json`,
  [NetworkNames.Ethereum]: `https://tokens.coingecko.com/${CoingeckoPlatform.Ethereum}/all.json`,
  [NetworkNames.Matic]: `https://tokens.coingecko.com/${CoingeckoPlatform.Matic}/all.json`,
  [NetworkNames.AstarEVM]: `https://tokens.coingecko.com/${CoingeckoPlatform.Astar}/all.json`,
  [NetworkNames.Okc]: `https://tokens.coingecko.com/${CoingeckoPlatform.Okc}/all.json`,
  [NetworkNames.Optimism]: `https://tokens.coingecko.com/${CoingeckoPlatform.Optimism}/all.json`,
  [NetworkNames.Moonriver]: `https://tokens.coingecko.com/${CoingeckoPlatform.Moonriver}/all.json`,
  [NetworkNames.Moonbeam]: `https://tokens.coingecko.com/${CoingeckoPlatform.Moonbeam}/all.json`,
  [NetworkNames.ShidenEVM]: `https://tokens.coingecko.com/${CoingeckoPlatform.Shiden}/all.json`,
  [NetworkNames.Canto]: `https://tokens.coingecko.com/${CoingeckoPlatform.Canto}/all.json`,
  [NetworkNames.Rootstock]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/rsk.json`,
  [NetworkNames.ZkSyncGoerli]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/zksyncgoerli.json`,
  [NetworkNames.ZkSync]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/zksync.json`,
  [NetworkNames.Arbitrum]: `https://tokens.coingecko.com/${CoingeckoPlatform.Arbitrum}/all.json`,
  [NetworkNames.Gnosis]: `https://tokens.coingecko.com/${CoingeckoPlatform.Gnosis}/all.json`,
  [NetworkNames.Avalanche]: `https://tokens.coingecko.com/${CoingeckoPlatform.Avalanche}/all.json`,
  [NetworkNames.Fantom]: `https://tokens.coingecko.com/${CoingeckoPlatform.Fantom}/all.json`,
  [NetworkNames.Klaytn]: `https://tokens.coingecko.com/${CoingeckoPlatform.Klaytn}/all.json`,
  [NetworkNames.Aurora]: `https://tokens.coingecko.com/${CoingeckoPlatform.Aurora}/all.json`,
  [NetworkNames.TomoChain]: `https://tokens.coingecko.com/${CoingeckoPlatform.TomoChain}/all.json`,
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
      t.address = t.address.toLowerCase();
      tObject[t.address] = t;
    });
    return tObject;
  });
};
export { TokenList, getKnownNetworkTokens };
