import { AssetsType, NodeType } from "@/types/provider";
import {
  CGToken,
  SupportedNetwork,
  TokenBalance,
} from "./types/tokenbalance-mew";
import MarketData from "../market-data";
import cacheFetch from "../cache-fetch";
import { fromBase } from "../utils/units";
import { toBN } from "web3-utils";
import BigNumber from "bignumber.js";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "../utils/number-formatter";
const API_ENPOINT = "https://tokenbalance.mewapi.io/";
const NATIVE_CONTRACT = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const TOKEN_FETCH_TTL = 1000 * 60 * 5;
export default (network: NodeType, address: string): Promise<AssetsType[]> => {
  const supportedNetworks: Record<string, SupportedNetwork> = {
    BNB: {
      tbName: "bsc",
      tokenurl:
        "https://requestcache.mewapi.io/?url=https://tokens.coingecko.com/binance-smart-chain/all.json",
      cgPlatform: "binance-smart-chain",
    },
    ETH: {
      tbName: "eth",
      tokenurl:
        "https://requestcache.mewapi.io/?url=https://tokens.coingecko.com/ethereum/all.json",
      cgPlatform: "ethereum",
    },
    MATIC: {
      tbName: "matic",
      tokenurl:
        "https://requestcache.mewapi.io/?url=https://tokens.coingecko.com/polygon-pos/all.json",
      cgPlatform: "polygon-pos",
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
        const nativeBalance = balances[NATIVE_CONTRACT];

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
            };
            assets.push(asset);
          }
        }
        assets.sort((a, b) => {
          if (a.balanceUSD > b.balanceUSD) return 1;
          else if (a.balanceUSD < b.balanceUSD) return -1;
          else return 0;
        });
        if (nativeBalance && nativeMarket.length && nativeMarket[0]) {
          const userBalance = fromBase(balances[NATIVE_CONTRACT].balance, 18);
          const usdBalance = new BigNumber(userBalance).times(
            nativeMarket[0].current_price
          );
          assets.unshift({
            balance: toBN(balances[NATIVE_CONTRACT].balance).toString(),
            balancef: formatFloatingPointValue(userBalance).value,
            balanceUSD: usdBalance.toNumber(),
            balanceUSDf: formatFiatValue(usdBalance.toString()).value,
            icon: nativeMarket[0].image,
            name: nativeMarket[0].name,
            symbol: nativeMarket[0].symbol,
            value: nativeMarket[0].current_price.toString(),
            valuef: formatFiatValue(nativeMarket[0].current_price.toString())
              .value,
            contract: NATIVE_CONTRACT,
            decimals: 18,
          });
        }
        return assets;
      }
    });
};
