import cacheFetch from '@/libs/cache-fetch';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { CGToken, SupportedNetworkNames } from './types/tokenbalance-mew';
const TOKEN_FETCH_TTL = 1000 * 60 * 60;
const TokenList: Record<SupportedNetworkNames, string> = {
  [NetworkNames.Arbitrum]: `https://tokens.coingecko.com/${CoingeckoPlatform.Arbitrum}/all.json`,
  [NetworkNames.ArbitrumNova]: `https://tokens.coingecko.com/${CoingeckoPlatform.ArbitrumNova}/all.json`,
  [NetworkNames.AstarEVM]: `https://tokens.coingecko.com/${CoingeckoPlatform.Astar}/all.json`,
  [NetworkNames.Aurora]: `https://tokens.coingecko.com/${CoingeckoPlatform.Aurora}/all.json`,
  [NetworkNames.Avalanche]: `https://tokens.coingecko.com/${CoingeckoPlatform.Avalanche}/all.json`,
  [NetworkNames.Base]: `https://tokens.coingecko.com/${CoingeckoPlatform.Base}/all.json`,
  [NetworkNames.Binance]: `https://tokens.coingecko.com/${CoingeckoPlatform.Binance}/all.json`,
  [NetworkNames.Blast]: `https://tokens.coingecko.com/${CoingeckoPlatform.Blast}/all.json`,
  [NetworkNames.Canto]: `https://tokens.coingecko.com/${CoingeckoPlatform.Canto}/all.json`,
  [NetworkNames.Celo]: `https://tokens.coingecko.com/${CoingeckoPlatform.Celo}/all.json`,
  [NetworkNames.Degen]: `https://tokens.coingecko.com/${CoingeckoPlatform.Degen}/all.json`,
  [NetworkNames.Ethereum]: `https://tokens.coingecko.com/${CoingeckoPlatform.Ethereum}/all.json`,
  [NetworkNames.Fantom]: `https://tokens.coingecko.com/${CoingeckoPlatform.Fantom}/all.json`,
  [NetworkNames.Gnosis]: `https://tokens.coingecko.com/${CoingeckoPlatform.Gnosis}/all.json`,
  [NetworkNames.Godwoken]: `https://tokens.coingecko.com/${CoingeckoPlatform.Godwoken}/all.json`,
  [NetworkNames.ImmutableZkevm]: `https://tokens.coingecko.com/${CoingeckoPlatform.ImmutableZkevm}/all.json`,
  [NetworkNames.Kaia]: `https://tokens.coingecko.com/${CoingeckoPlatform.Kaia}/all.json`,
  [NetworkNames.Linea]: `https://tokens.coingecko.com/${CoingeckoPlatform.Linea}/all.json`,
  [NetworkNames.MantaPacific]: `https://tokens.coingecko.com/${CoingeckoPlatform.MantaPacific}/all.json`,
  [NetworkNames.Matic]: `https://tokens.coingecko.com/${CoingeckoPlatform.Matic}/all.json`,
  [NetworkNames.MaticZK]: `https://tokens.coingecko.com/${CoingeckoPlatform.MaticZK}/all.json`,
  [NetworkNames.Mode]: `https://tokens.coingecko.com/${CoingeckoPlatform.Mode}/all.json`,
  [NetworkNames.Moonbeam]: `https://tokens.coingecko.com/${CoingeckoPlatform.Moonbeam}/all.json`,
  [NetworkNames.Moonriver]: `https://tokens.coingecko.com/${CoingeckoPlatform.Moonriver}/all.json`,
  [NetworkNames.Okc]: `https://tokens.coingecko.com/${CoingeckoPlatform.Okc}/all.json`,
  [NetworkNames.OpBNB]: `https://tokens.coingecko.com/${CoingeckoPlatform.OpBNB}/all.json`,
  [NetworkNames.Optimism]: `https://tokens.coingecko.com/${CoingeckoPlatform.Optimism}/all.json`,
  [NetworkNames.ProofOfPlayApex]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/apex.json`,
  [NetworkNames.Rari]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/rari.json`,
  [NetworkNames.Rollux]: `https://tokens.coingecko.com/${CoingeckoPlatform.Rollux}/all.json`,
  [NetworkNames.Rootstock]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/tokenlists/rsk.json`,
  [NetworkNames.Sanko]: `https://tokens.coingecko.com/${CoingeckoPlatform.Sanko}/all.json`,
  [NetworkNames.Scroll]: `https://tokens.coingecko.com/${CoingeckoPlatform.Scroll}/all.json`,
  [NetworkNames.Shibarium]: `https://tokens.coingecko.com/${CoingeckoPlatform.Shibarium}/all.json`,
  [NetworkNames.ShidenEVM]: `https://tokens.coingecko.com/${CoingeckoPlatform.Shiden}/all.json`,
  [NetworkNames.Solana]: `https://tokens.coingecko.com/${CoingeckoPlatform.Solana}/all.json`,
  [NetworkNames.SyscoinNEVM]: `https://tokens.coingecko.com/${CoingeckoPlatform.Syscoin}/all.json`,
  [NetworkNames.Telos]: `https://tokens.coingecko.com/${CoingeckoPlatform.Telos}/all.json`,
  [NetworkNames.TomoChain]: `https://tokens.coingecko.com/${CoingeckoPlatform.TomoChain}/all.json`,
  [NetworkNames.XLayer]: `https://tokens.coingecko.com/${CoingeckoPlatform.XLayer}/all.json`,
  [NetworkNames.ZkSync]: `https://tokens.coingecko.com/${CoingeckoPlatform.Zksync}/all.json`,
  [NetworkNames.Gravity]: `https://tokens.coingecko.com/${CoingeckoPlatform.Gravity}/all.json`,
  [NetworkNames.Abstract]: `https://tokens.coingecko.com/${CoingeckoPlatform.Abstract}/all.json`,
  [NetworkNames.Story]: `https://tokens.coingecko.com/${CoingeckoPlatform.Story}/all.json`,
  [NetworkNames.Ink]: `https://tokens.coingecko.com/${CoingeckoPlatform.Ink}/all.json`,
  [NetworkNames.Bera]: `https://tokens.coingecko.com/${CoingeckoPlatform.Berachain}/all.json`,
  [NetworkNames.Unichain]: `https://tokens.coingecko.com/${CoingeckoPlatform.Unichain}/all.json`,
};

const getKnownNetworkTokens = async (
  networkName: NetworkNames,
): Promise<Record<string, CGToken>> => {
  if (!TokenList[networkName as SupportedNetworkNames]) return {};
  return cacheFetch(
    {
      url: TokenList[networkName as SupportedNetworkNames],
    },
    TOKEN_FETCH_TTL,
  )
    .then(json => {
      const tokens: CGToken[] = json.tokens;
      const tObject: Record<string, CGToken> = {};
      tokens.forEach(t => {
        t.address =
          networkName !== NetworkNames.Solana
            ? t.address.toLowerCase()
            : t.address;
        tObject[t.address] = t;
      });
      return tObject;
    })
    .catch(() => ({}));
};
export { TokenList, getKnownNetworkTokens };
