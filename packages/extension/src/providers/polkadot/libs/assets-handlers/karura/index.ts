import { AssetsType, NodeType } from "@/types/provider";
import supported from "./supportedTokens";
import { options } from "@acala-network/api";
import { ApiPromise, WsProvider } from "@polkadot/api";
import MarketData from "@/libs/market-data";
import { OrmlTokensAccountData } from "@acala-network/types/interfaces/types-lookup";
import BigNumber from "bignumber.js";
import { fromBase } from "@/libs/utils/units";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
import Sparkline from "@/libs/sparkline";
import { AccountInfoWithRefCount } from "@polkadot/types/interfaces";

export default async (
  network: NodeType,
  address: string
): Promise<AssetsType[]> => {
  const provider = new WsProvider(network.node);
  const api = new ApiPromise(options({ provider }));
  await api.isReadyOrError;
  const balancePromises = supported.map(async (token) => {
    if (token.foreignAssetId !== undefined) {
      return api.query.tokens.accounts(address, {
        ForeignAsset: token.foreignAssetId,
      });
    } else if (token.stableAssetId !== undefined) {
      return api.query.tokens.accounts(address, {
        StableAssetPoolToken: token.stableAssetId,
      });
    } else if (token.erc20Address !== undefined) {
      return api.query.tokens.accounts(address, {
        Erc20: token.erc20Address,
      });
    } else if (token.native) {
      return api.query.system
        .account<AccountInfoWithRefCount>(address)
        .then(({ data }) => data);
    }
    return api.query.tokens.accounts(address, {
      Token: token.symbol,
    });
  });
  const marketData = new MarketData();
  const market = await marketData.getMarketData(
    supported.map(({ coingeckoID }) => coingeckoID || "")
  );
  const balances = (await Promise.all(
    balancePromises
  )) as unknown as OrmlTokensAccountData[];

  const tokens: AssetsType[] = supported.map((st, idx) => {
    const userBalance = fromBase(balances[idx].free.toString(), st.decimals);
    const usdBalance = new BigNumber(userBalance).times(
      market[idx]?.current_price || 0
    );
    return {
      balance: balances[idx].free.toString(),
      balancef: formatFloatingPointValue(userBalance).value,
      balanceUSD: usdBalance.toNumber(),
      balanceUSDf: formatFiatValue(usdBalance.toString()).value,
      decimals: st.decimals,
      icon: st.image,
      name: st.name,
      symbol: st.symbol,
      priceChangePercentage:
        market[idx]?.price_change_percentage_7d_in_currency || 0,
      sparkline: market[idx]
        ? new Sparkline(market[idx]?.sparkline_in_7d.price, 25).dataUri
        : "",
      value: market[idx]?.current_price.toString() || "0",
      valuef: formatFloatingPointValue(
        market[idx]?.current_price.toString() || "0"
      ).value,
    };
  });
  const sorted = [...tokens].filter((val, idx) => idx !== 0);
  sorted.sort((a, b) => {
    if (a.balanceUSD < b.balanceUSD) return 1;
    else if (a.balanceUSD > b.balanceUSD) return -1;
    else return 0;
  });
  sorted.unshift(tokens[0]);
  return sorted;
};
