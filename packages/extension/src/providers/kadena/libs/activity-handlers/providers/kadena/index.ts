import cacheFetch from "@/libs/cache-fetch";
import MarketData from "@/libs/market-data";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { NetworkEndpoints } from "./configs";
const TTL = 30;
const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<any[]> => {
  return cacheFetch(
    {
      // https://estats.testnet.chainweb.com/txs/account/c9205406b2c5a7598760aa42d4d4453c5dcd06c2aedb86c000ad68b433fc0bdf?limit=20&token=coin
      url: `${endpoint}txs/account/${address}?limit=20&token=coin`,
    },
    TTL
  ).then((res) => {
    // if (res.message !== "Success") return [];
    return res ? res : [];
  });
};
export default async (
  network: BaseNetwork,
  address: string
): Promise<Activity[]> => {
  const enpoint =
    NetworkEndpoints[network.name as keyof typeof NetworkEndpoints];
  const activities = await getAddressActivity(address, enpoint);
  let price = "0";
  if (network.coingeckoID) {
    const marketData = new MarketData();
    await marketData
      .getTokenPrice(network.coingeckoID)
      .then((mdata) => (price = mdata || "0"));
  }
  return activities.map((activity: any) => {
    const amountInt = parseInt(
      activity.amount.substring(0, activity.amount.indexOf("."))
    );
    const balanceToString = activity.amount
      .toString()
      .replace(".", "")
      .padEnd(7 + amountInt, "0");
    return {
      from: activity.fromAccount,
      to: activity.toAccount,
      isIncoming: activity.fromAccount !== address,
      network: network.name,
      rawInfo: activity,
      status: ActivityStatus.success,
      timestamp: new Date(activity.blockTime).getTime(),
      value: balanceToString,
      transactionHash: activity.requestKey,
      type: ActivityType.transaction,
      token: {
        decimals: network.decimals,
        icon: network.icon,
        name: network.currencyNameLong,
        symbol:
          activity.token !== "coin" ? activity.token : network.currencyName,
        price: price,
      },
    };
  });
};
