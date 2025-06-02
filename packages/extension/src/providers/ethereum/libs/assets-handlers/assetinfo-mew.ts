import { AssetsType } from '@/types/provider';
import {
  CGToken,
  SupportedNetwork,
  SupportedNetworkNames,
  TokenBalance,
} from './types/tokenbalance-mew';
import MarketData from '@/libs/market-data';
import { fromBase } from '@enkryptcom/utils';
import { toBN } from 'web3-utils';
import BigNumber from 'bignumber.js';
import {

  formatFloatingPointValue,
} from '@/libs/utils/number-formatter';
import API from '@/providers/ethereum/libs/api';
import Sparkline from '@/libs/sparkline';
import { BaseNetwork } from '@/types/base-network';
import { EvmNetwork } from '../../types/evm-network';
import { getKnownNetworkTokens } from './token-lists';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { NATIVE_TOKEN_ADDRESS } from '../common';
import getBlockscoutBalances from './blockscout';
import getTomoBalances from './tomochain';
import getSolBalances from './solanachain';
import { CoinGeckoTokenMarket } from '@/libs/market-data/types';

const API_ENPOINT = 'https://tokenbalance.mewapi.io/';
const API_ENPOINT2 = 'https://partners.mewapi.io/balances/';

const supportedNetworks: Record<SupportedNetworkNames, SupportedNetwork> = {
  [NetworkNames.Binance]: {
    tbName: 'bsc',
    cgPlatform: CoingeckoPlatform.Binance,
  },
  [NetworkNames.Ethereum]: {
    tbName: 'eth',
    cgPlatform: CoingeckoPlatform.Ethereum,
  },
  [NetworkNames.Matic]: {
    tbName: 'matic',
    cgPlatform: CoingeckoPlatform.Matic,
  },
  [NetworkNames.AstarEVM]: {
    tbName: 'astar',
    cgPlatform: CoingeckoPlatform.Astar,
  },
  [NetworkNames.Okc]: {
    tbName: 'okt',
    cgPlatform: CoingeckoPlatform.Okc,
  },
  [NetworkNames.Optimism]: {
    tbName: 'op',
    cgPlatform: CoingeckoPlatform.Optimism,
  },
  [NetworkNames.Moonriver]: {
    tbName: 'movr',
    cgPlatform: CoingeckoPlatform.Moonriver,
  },
  [NetworkNames.Moonbeam]: {
    tbName: 'mobm',
    cgPlatform: CoingeckoPlatform.Moonbeam,
  },
  [NetworkNames.ShidenEVM]: {
    tbName: 'sdn',
    cgPlatform: CoingeckoPlatform.Shiden,
  },
  [NetworkNames.Canto]: {
    tbName: 'canto',
    cgPlatform: CoingeckoPlatform.Canto,
  },
  [NetworkNames.Rootstock]: {
    cgPlatform: CoingeckoPlatform.Rootstock,
    bsEndpoint: true,
  },
  [NetworkNames.Arbitrum]: {
    tbName: 'arb',
    cgPlatform: CoingeckoPlatform.Arbitrum,
  },
  [NetworkNames.ArbitrumNova]: {
    tbName: 'nova',
    cgPlatform: CoingeckoPlatform.ArbitrumNova,
  },
  [NetworkNames.Gnosis]: {
    tbName: 'xdai',
    cgPlatform: CoingeckoPlatform.Gnosis,
  },
  [NetworkNames.Avalanche]: {
    tbName: 'avax',
    cgPlatform: CoingeckoPlatform.Avalanche,
  },
  [NetworkNames.Fantom]: {
    tbName: 'ftm',
    cgPlatform: CoingeckoPlatform.Fantom,
  },
  [NetworkNames.Kaia]: {
    tbName: 'klay',
    cgPlatform: CoingeckoPlatform.Kaia,
  },
  [NetworkNames.Aurora]: {
    tbName: 'aurora',
    cgPlatform: CoingeckoPlatform.Aurora,
  },
  [NetworkNames.ZkSync]: {
    tbName: 'era',
    cgPlatform: CoingeckoPlatform.Zksync,
  },
  [NetworkNames.MaticZK]: {
    tbName: 'pze',
    cgPlatform: CoingeckoPlatform.MaticZK,
  },
  [NetworkNames.Celo]: {
    tbName: 'celo',
    cgPlatform: CoingeckoPlatform.Celo,
  },
  [NetworkNames.TomoChain]: {
    tbName: '',
    cgPlatform: CoingeckoPlatform.TomoChain,
  },
  [NetworkNames.Shibarium]: {
    tbName: 'shib',
    cgPlatform: CoingeckoPlatform.Shibarium,
  },
  [NetworkNames.Base]: {
    tbName: 'base',
    cgPlatform: CoingeckoPlatform.Base,
  },
  [NetworkNames.SyscoinNEVM]: {
    cgPlatform: CoingeckoPlatform.Syscoin,
    bsEndpoint: true,
  },
  [NetworkNames.Rollux]: {
    cgPlatform: CoingeckoPlatform.Rollux,
    bsEndpoint: true,
  },
  [NetworkNames.Telos]: {
    tbName: 'tlos',
    cgPlatform: CoingeckoPlatform.Telos,
  },
  [NetworkNames.Blast]: {
    tbName: 'blast',
    cgPlatform: CoingeckoPlatform.Blast,
  },
  [NetworkNames.Sanko]: {
    tbName: 'sanko',
    cgPlatform: CoingeckoPlatform.Sanko,
  },
  [NetworkNames.Degen]: {
    tbName: 'degen',
    cgPlatform: CoingeckoPlatform.Degen,
  },
  [NetworkNames.XLayer]: {
    tbName: 'xlayer',
    cgPlatform: CoingeckoPlatform.XLayer,
  },
  [NetworkNames.ProofOfPlayApex]: {
    tbName: 'apex',
    cgPlatform: undefined,
  },
  [NetworkNames.Godwoken]: {
    tbName: 'ckb',
    cgPlatform: CoingeckoPlatform.Godwoken,
  },
  [NetworkNames.Linea]: {
    tbName: 'linea',
    cgPlatform: CoingeckoPlatform.Linea,
  },
  [NetworkNames.MantaPacific]: {
    tbName: 'manta',
    cgPlatform: CoingeckoPlatform.MantaPacific,
  },
  [NetworkNames.Mode]: {
    tbName: 'mode',
    cgPlatform: CoingeckoPlatform.Mode,
  },
  [NetworkNames.OpBNB]: {
    tbName: 'opbnb',
    cgPlatform: CoingeckoPlatform.OpBNB,
  },
  [NetworkNames.Scroll]: {
    tbName: 'scrl',
    cgPlatform: CoingeckoPlatform.Scroll,
  },
  [NetworkNames.ImmutableZkevm]: {
    tbName: 'itze',
    cgPlatform: CoingeckoPlatform.ImmutableZkevm,
  },
  [NetworkNames.Rari]: {
    tbName: 'rari',
    cgPlatform: undefined,
  },
  [NetworkNames.Solana]: {
    tbName: '',
    cgPlatform: CoingeckoPlatform.Solana,
  },
  [NetworkNames.Gravity]: {
    tbName: 'gravity',
    cgPlatform: CoingeckoPlatform.Gravity,
  },
  [NetworkNames.Abstract]: {
    tbName: 'abs',
    cgPlatform: CoingeckoPlatform.Abstract,
  },
  [NetworkNames.Story]: {
    tbName: 'story',
    cgPlatform: CoingeckoPlatform.Story,
  },
  [NetworkNames.Ink]: {
    tbName: 'ink',
    cgPlatform: CoingeckoPlatform.Ink,
  },
  [NetworkNames.Bera]: {
    tbName: 'bera',
    cgPlatform: CoingeckoPlatform.Berachain,
  },
  [NetworkNames.Unichain]: {
    tbName: 'uni',
    cgPlatform: CoingeckoPlatform.Unichain,
  },
  [NetworkNames.Conflux]: {
    tbName: 'cfx',
    cgPlatform: CoingeckoPlatform.Conflux,
  },
};

const getTokens = (
  network: BaseNetwork,
  address: string,
): Promise<TokenBalance[]> => {
  const chain = network.name as SupportedNetworkNames;
  if (chain === NetworkNames.TomoChain) {
    return getTomoBalances(chain, address);
  } else if (chain === NetworkNames.Solana) {
    return getSolBalances(network, address);
  } else if (supportedNetworks[chain].bsEndpoint) {
    return getBlockscoutBalances(chain, address);
  }
  let url = '';
  if (chain === NetworkNames.Ethereum || chain === NetworkNames.Binance)
    url = `${API_ENPOINT}${supportedNetworks[chain].tbName}?address=${address}&platform=enkrypt&type=internal`;
  else
    url = `${API_ENPOINT2}${supportedNetworks[chain].tbName}/${address}?platform=enkrypt&type=internal`;
  return fetch(url)
    .then(res => res.json())
    .then((json: any) => {
      if (json.error)
        return Promise.reject(
          `TOKENBALANCE-MEW: ${JSON.stringify(json.error)}`,
        );
      else {
        const isNativeAvailable = json.result.length
          ? json.result.find((i: any) => i.contract === NATIVE_TOKEN_ADDRESS)
          : false;
        if (!json.result.length || !isNativeAvailable) {
          json.result.push({
            contract: NATIVE_TOKEN_ADDRESS,
            balance: '0x0',
          });
        }
        return json.result as TokenBalance[];
      }
    });
};

export default (
  network: BaseNetwork,
  address: string,
): Promise<AssetsType[]> => {
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error('TOKENBALANCE-MEW: network not supported');
  const networkName = network.name as SupportedNetworkNames;
  return getTokens(network, address).then(async tokens => {
    const balances: Record<string, TokenBalance> = tokens.reduce(
      (obj, cur) => ({ ...obj, [cur.contract]: cur }),
      {},
    );
    const marketData = new MarketData();

    const marketInfo = supportedNetworks[networkName].cgPlatform
      ? await marketData.getMarketInfoByContracts(
        Object.keys(balances).filter(
          contract => contract !== NATIVE_TOKEN_ADDRESS,
        ),
        supportedNetworks[networkName].cgPlatform as CoingeckoPlatform,
      )
      : tokens.reduce(
        (obj, cur) => ({ ...obj, [cur.contract]: null }),
        {} as Record<string, CoinGeckoTokenMarket | null>,
      );
    if (network.coingeckoID) {
      const nativeMarket = await marketData.getMarketData([
        network.coingeckoID,
      ]);
      marketInfo[NATIVE_TOKEN_ADDRESS] = nativeMarket[0];
    } else {
      marketInfo[NATIVE_TOKEN_ADDRESS] = {
        id: '',
        symbol: network.currencyName,
        name: network.name_long,
        image: network.icon,
        current_price: 0,
        market_cap: 0,
        market_cap_rank: 0,
        high_24h: 0,
        low_24h: 0,
        price_change_24h: 0,
        price_change_percentage_24h: 0,
        sparkline_in_24h: { price: [] },
        price_change_percentage_24h_in_currency: 0,
      };
    }

    const assets: AssetsType[] = [];
    const tokenInfo: Record<string, CGToken> = await getKnownNetworkTokens(
      network.name,
    );
    tokenInfo[NATIVE_TOKEN_ADDRESS] = {
      chainId: (network as EvmNetwork).chainID,
      name: network.name_long,
      decimals: network.decimals,
      address: NATIVE_TOKEN_ADDRESS,
      logoURI: network.icon,
      symbol: network.currencyName,
    };

    const unknownTokens: string[] = [];
    let nativeAsset: AssetsType | null = null;
    for (const [address, market] of Object.entries(marketInfo)) {
      if (market && tokenInfo[address]) {
        const userBalance = fromBase(
          balances[address].balance,
          tokenInfo[address].decimals,
        );
        const currentPrice = market.current_price ?? 0;
        const usdBalance = new BigNumber(userBalance).times(currentPrice);
        const asset: AssetsType = {
          balance: toBN(balances[address].balance).toString(),
          balancef: formatFloatingPointValue(userBalance).value,
          balanceUSD: usdBalance.toNumber(),
          balanceUSDf: usdBalance.toString(),
          icon: market.image,
          name: market.name,
          symbol: market.symbol,
          value: currentPrice.toString(),
          valuef: currentPrice.toString(),
          contract: address,
          decimals: tokenInfo[address].decimals,
          sparkline: new Sparkline(market.sparkline_in_24h.price, 25)
            .dataValues,
          priceChangePercentage:
            market.price_change_percentage_24h_in_currency || 0,
        };
        if (address !== NATIVE_TOKEN_ADDRESS) assets.push(asset);
        else nativeAsset = asset;
      } else {
        unknownTokens.push(address);
      }
    }

    assets.sort((a, b) => {
      if (a.balanceUSD < b.balanceUSD) return 1;
      else if (a.balanceUSD > b.balanceUSD) return -1;
      else return 0;
    });
    assets.unshift(nativeAsset as AssetsType);
    if (unknownTokens.length && network.api) {
      const api = (await network.api()) as API;
      const promises = unknownTokens.map(t => api.getTokenInfo(t));
      await Promise.all(promises).then(tokenMeta => {
        tokenMeta.forEach((tInfo, idx) => {
          if (tInfo.symbol === 'UNKNWN') return;
          const userBalance = fromBase(
            balances[unknownTokens[idx]].balance,
            tInfo.decimals,
          );
          const asset: AssetsType = {
            balance: toBN(balances[unknownTokens[idx]].balance).toString(),
            balancef: formatFloatingPointValue(userBalance).value,
            balanceUSD: 0,
            balanceUSDf: '0',
            icon:
              tokenInfo[unknownTokens[idx]]?.logoURI ||
              tInfo.icon ||
              network.icon,
            name: tInfo.name,
            symbol: tInfo.symbol,
            value: '0',
            valuef: '0',
            contract: unknownTokens[idx],
            decimals: tInfo.decimals,
            sparkline: '',
            priceChangePercentage: 0,
          };
          assets.push(asset);
        });
      });
    }
    return assets;
  });
};
