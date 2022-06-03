import { AssetsType } from "@/types/provider";
import {
  CGToken,
  SupportedNetwork,
  TokenBalance,
} from "./types/tokenbalance-mew";
import MarketData from "@/libs/market-data";
import cacheFetch from "@/libs/cache-fetch";
import { fromBase } from "@/libs/utils/units";
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
import TokenLists from "./token-lists";
import networks from "../../networks";
const API_ENPOINT = "https://tokenbalance.mewapi.io/";
const NATIVE_CONTRACT = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const TOKEN_FETCH_TTL = 1000 * 60 * 60;
export default (
  network: BaseNetwork,
  address: string
): Promise<AssetsType[]> => {
  const supportedNetworks: Record<string, SupportedNetwork> = {
    [networks.bsc.name]: {
      tbName: "bsc",
      tokenurl: TokenLists[networks.bsc.name],
      cgPlatform: networks.bsc.coingeckoID as string,
    },
    [networks.ethereum.name]: {
      tbName: "eth",
      tokenurl: TokenLists[networks.ethereum.name],
      cgPlatform: networks.ethereum.coingeckoID as string,
    },
    [networks.matic.name]: {
      tbName: "matic",
      tokenurl: TokenLists[networks.matic.name],
      cgPlatform: networks.matic.coingeckoID as string,
    },
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("TOKENBALANCE-MEW: network not supported");
  const query = `${API_ENPOINT}${
    supportedNetworks[network.name].tbName
  }?address=${address}`;
  return fetch(query)
    .then((res) => res.json())
    .then(async (json) => {
      if (json.error) throw new Error(`TOKENBALANCE-MEW: ${json.error}`);
      else {
        const balances: Record<string, TokenBalance> = (
          json.result as TokenBalance[]
        ).reduce((obj, cur) => ({ ...obj, [cur.contract]: cur }), {});

        const marketData = new MarketData();
        const nativeMarket = await marketData.getMarketData(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [network.coingeckoID!] //it wont be null since all supported networks have coingeckoID
        );
        const marketInfo = await marketData.getMarketInfoByContracts(
          Object.keys(balances).filter(
            (contract) => contract !== NATIVE_CONTRACT
          ),
          supportedNetworks[network.name].cgPlatform
        );
        marketInfo[NATIVE_CONTRACT] = nativeMarket[0];

        const assets: AssetsType[] = [];
        const tokenInfo: Record<string, CGToken> = await cacheFetch(
          {
            url: supportedNetworks[network.name].tokenurl,
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

        tokenInfo[NATIVE_CONTRACT] = {
          chainId: (network as EvmNetwork).chainID,
          name: network.name_long,
          decimals: 18,
          address: NATIVE_CONTRACT,
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
              sparkline: new Sparkline(market.sparkline_in_7d.price, 25)
                .dataUri,
              priceChangePercentage:
                market.price_change_percentage_7d_in_currency || 0,
            };
            if (address !== NATIVE_CONTRACT) assets.push(asset);
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
          await Promise.all(promises).then((tokenInfo) => {
            tokenInfo.forEach((tInfo, idx) => {
              const userBalance = fromBase(
                balances[unknownTokens[idx]].balance,
                tInfo.decimals
              );
              const asset: AssetsType = {
                balance: toBN(balances[unknownTokens[idx]].balance).toString(),
                balancef: formatFloatingPointValue(userBalance).value,
                balanceUSD: 0,
                balanceUSDf: formatFiatValue("0").value,
                icon: nativeMarket[0]?.image || "",
                name: tInfo.name,
                symbol: tInfo.symbol,
                value: "0",
                valuef: formatFiatValue("0").value,
                contract: address,
                decimals: tInfo.decimals,
                sparkline: "",
                priceChangePercentage: 0,
              };
              assets.push(asset);
            });
          });
        }
        return assets;
      }
    });
};
