import { AssetsType } from "@/types/provider";
import {
  CGToken,
  SupportedNetwork,
  SupportedNetworkNames,
  TokenBalance,
} from "./types/tokenbalance-mew";
import MarketData from "@/libs/market-data";
import { fromBase } from "@enkryptcom/utils";
import { toBN } from "web3-utils";
import BigNumber from "bignumber.js";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
import API from "@/providers/ethereum/libs/api";
import Sparkline from "@/libs/sparkline";
import { BaseNetwork } from "@/types/base-network";
import { EvmNetwork } from "../../types/evm-network";
import { getKnownNetworkTokens } from "./token-lists";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { NATIVE_TOKEN_ADDRESS } from "../common";
import getZKSyncBalances from "./zksync";
import getTomoBalances from "./tomochain";

const API_ENPOINT = "https://tokenbalance.mewapi.io/";
const API_ENPOINT2 = "https://partners.mewapi.io/balances/";

const supportedNetworks: Record<SupportedNetworkNames, SupportedNetwork> = {
  [NetworkNames.Binance]: {
    tbName: "bsc",
    cgPlatform: CoingeckoPlatform.Binance,
  },
  [NetworkNames.Ethereum]: {
    tbName: "eth",
    cgPlatform: CoingeckoPlatform.Ethereum,
  },
  [NetworkNames.Matic]: {
    tbName: "matic",
    cgPlatform: CoingeckoPlatform.Matic,
  },
  [NetworkNames.AstarEVM]: {
    tbName: "astar",
    cgPlatform: CoingeckoPlatform.Astar,
  },
  [NetworkNames.Okc]: {
    tbName: "okt",
    cgPlatform: CoingeckoPlatform.Okc,
  },
  [NetworkNames.Optimism]: {
    tbName: "op",
    cgPlatform: CoingeckoPlatform.Optimism,
  },
  [NetworkNames.Moonriver]: {
    tbName: "movr",
    cgPlatform: CoingeckoPlatform.Moonriver,
  },
  [NetworkNames.Moonbeam]: {
    tbName: "mobm",
    cgPlatform: CoingeckoPlatform.Moonbeam,
  },
  [NetworkNames.ShidenEVM]: {
    tbName: "sdn",
    cgPlatform: CoingeckoPlatform.Shiden,
  },
  [NetworkNames.Canto]: {
    tbName: "canto",
    cgPlatform: CoingeckoPlatform.Canto,
  },
  [NetworkNames.Rootstock]: {
    tbName: "rsk",
    cgPlatform: CoingeckoPlatform.Rootstock,
  },
  [NetworkNames.Arbitrum]: {
    tbName: "arb",
    cgPlatform: CoingeckoPlatform.Arbitrum,
  },
  [NetworkNames.Gnosis]: {
    tbName: "xdai",
    cgPlatform: CoingeckoPlatform.Gnosis,
  },
  [NetworkNames.Avalanche]: {
    tbName: "avax",
    cgPlatform: CoingeckoPlatform.Avalanche,
  },
  [NetworkNames.Fantom]: {
    tbName: "ftm",
    cgPlatform: CoingeckoPlatform.Fantom,
  },
  [NetworkNames.Klaytn]: {
    tbName: "klay",
    cgPlatform: CoingeckoPlatform.Klaytn,
  },
  [NetworkNames.Aurora]: {
    tbName: "aurora",
    cgPlatform: CoingeckoPlatform.Aurora,
  },
  [NetworkNames.TomoChain]: {
    tbName: "",
    cgPlatform: CoingeckoPlatform.TomoChain,
  },
  [NetworkNames.ZkSyncGoerli]: {
    tbName: "",
  },
  [NetworkNames.ZkSync]: {
    tbName: "",
  },
};

const getTokens = (
  chain: SupportedNetworkNames,
  address: string
): Promise<TokenBalance[]> => {
  if (chain === NetworkNames.ZkSyncGoerli || chain === NetworkNames.ZkSync) {
    return getZKSyncBalances(chain, address);
  }
  if (chain === NetworkNames.TomoChain) {
    return getTomoBalances(chain, address);
  }
  let url = "";
  if (chain === NetworkNames.Ethereum || chain === NetworkNames.Binance)
    url = `${API_ENPOINT}${supportedNetworks[chain].tbName}?address=${address}`;
  else url = `${API_ENPOINT2}${supportedNetworks[chain].tbName}/${address}`;
  return fetch(url)
    .then((res) => res.json())
    .then((json) => {
      if (json.error)
        return Promise.reject(
          `TOKENBALANCE-MEW: ${JSON.stringify(json.error)}`
        );
      else {
        const isNativeAvailable = json.result.length
          ? json.result.find((i: any) => i.contract === NATIVE_TOKEN_ADDRESS)
          : false;
        if (!json.result.length || !isNativeAvailable) {
          json.result.push({
            contract: NATIVE_TOKEN_ADDRESS,
            balance: "0x0",
          });
        }
        return json.result as TokenBalance[];
      }
    });
};

export default (
  network: BaseNetwork,
  address: string
): Promise<AssetsType[]> => {
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("TOKENBALANCE-MEW: network not supported");
  const networkName = network.name as SupportedNetworkNames;
  return getTokens(networkName, address).then(async (tokens) => {
    const balances: Record<string, TokenBalance> = tokens.reduce(
      (obj, cur) => ({ ...obj, [cur.contract]: cur }),
      {}
    );

    const marketData = new MarketData();

    const marketInfo = supportedNetworks[networkName].cgPlatform
      ? await marketData.getMarketInfoByContracts(
          Object.keys(balances).filter(
            (contract) => contract !== NATIVE_TOKEN_ADDRESS
          ),
          supportedNetworks[networkName].cgPlatform as CoingeckoPlatform
        )
      : tokens.reduce((obj, cur) => ({ ...obj, [cur.contract]: null }), {});
    if (network.coingeckoID) {
      const nativeMarket = await marketData.getMarketData([
        network.coingeckoID,
      ]);
      marketInfo[NATIVE_TOKEN_ADDRESS] = nativeMarket[0];
    } else {
      marketInfo[NATIVE_TOKEN_ADDRESS] = {
        id: "",
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
        sparkline_in_7d: { price: [] },
        price_change_percentage_7d_in_currency: 0,
      };
    }

    const assets: AssetsType[] = [];
    const tokenInfo: Record<string, CGToken> = await getKnownNetworkTokens(
      network.name
    );

    tokenInfo[NATIVE_TOKEN_ADDRESS] = {
      chainId: (network as EvmNetwork).chainID,
      name: network.name_long,
      decimals: 18,
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
          tokenInfo[address].decimals
        );
        const usdBalance = new BigNumber(userBalance).times(
          market.current_price
        );
        const asset: AssetsType = {
          balance: toBN(balances[address].balance).toString(),
          balancef: formatFloatingPointValue(userBalance).value,
          balanceUSD: usdBalance.toNumber(),
          balanceUSDf: formatFiatValue(usdBalance.toString()).value,
          icon: market.image,
          name: market.name,
          symbol: market.symbol,
          value: market.current_price.toString(),
          valuef: formatFiatValue(market.current_price.toString()).value,
          contract: address,
          decimals: tokenInfo[address].decimals,
          sparkline: new Sparkline(market.sparkline_in_7d.price, 25).dataValues,
          priceChangePercentage:
            market.price_change_percentage_7d_in_currency || 0,
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
      const promises = unknownTokens.map((t) => api.getTokenInfo(t));
      await Promise.all(promises).then((tokenMeta) => {
        tokenMeta.forEach((tInfo, idx) => {
          const userBalance = fromBase(
            balances[unknownTokens[idx]].balance,
            tInfo.decimals
          );
          const asset: AssetsType = {
            balance: toBN(balances[unknownTokens[idx]].balance).toString(),
            balancef: formatFloatingPointValue(userBalance).value,
            balanceUSD: 0,
            balanceUSDf: formatFiatValue("0").value,
            icon: tokenInfo[unknownTokens[idx]]?.logoURI || network.icon,
            name: tInfo.name,
            symbol: tInfo.symbol,
            value: "0",
            valuef: formatFiatValue("0").value,
            contract: unknownTokens[idx],
            decimals: tInfo.decimals,
            sparkline: "",
            priceChangePercentage: 0,
          };
          assets.push(asset);
        });
      });
    }

    return assets;
  });
};
