import { AssetsType, NodeType } from "@/types/provider";
import { options } from "@acala-network/api";
import { ApiPromise, WsProvider } from "@polkadot/api";
import MarketData from "@/libs/market-data";
import BigNumber from "bignumber.js";
import { fromBase } from "@/libs/utils/units";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
import Sparkline from "@/libs/sparkline";
import {
  AccountData,
  AccountInfoWithRefCount,
} from "@polkadot/types/interfaces";
import { PolkadotNodeType } from "@/providers/polkadot/types";

export default async (
  network: NodeType,
  address: string
): Promise<AssetsType[]> => {
  const provider = new WsProvider(network.node);
  const api = new ApiPromise(options({ provider }));
  await api.isReadyOrError;
  const supported = [network as PolkadotNodeType];
  const balancePromises = supported.map(() => {
    return api.query.system
      .account<AccountInfoWithRefCount>(address)
      .then(({ data }) => data);
  });
  const marketData = new MarketData();
  const market = await marketData.getMarketData(
    supported
      .filter((s) => !!s.coingeckoID)
      .map((supported) => supported.coingeckoID as string)
  );
  const balances = (await Promise.all(
    balancePromises
  )) as unknown as AccountData[];

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
      icon: st.icon,
      name: st.name,
      symbol: st.currencyName,
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
