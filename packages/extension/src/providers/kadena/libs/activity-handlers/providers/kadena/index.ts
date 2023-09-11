import cacheFetch from "@/libs/cache-fetch";
import MarketData from "@/libs/market-data";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { NetworkEndpoints } from "./configs";
import { formatDecimals } from "../../../utils";

const TTL = 30;

const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<any[]> => {
  return cacheFetch(
    {
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
    return {
      from: activity.fromAccount,
      to: activity.toAccount,
      isIncoming: activity.fromAccount !== address,
      network: network.name,
      rawInfo: activity,
      status: ActivityStatus.success,
      timestamp: new Date(activity.blockTime).getTime(),
      value: formatDecimals(activity.amount, network.decimals),
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
