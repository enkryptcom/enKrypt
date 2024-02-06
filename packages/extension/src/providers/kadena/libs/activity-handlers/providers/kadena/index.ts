import cacheFetch from "@/libs/cache-fetch";
import MarketData from "@/libs/market-data";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { NetworkEndpoints, NetworkTtls } from "./configs";
import ActivityState from "@/libs/activity-state";
import { toBase } from "@enkryptcom/utils";

const getAddressActivity = async (
  address: string,
  endpoint: string,
  ttl: number,
  height: number
): Promise<any[]> => {
  const url = `${endpoint}txs/account/${address}?minheight=${height}&limit=200&token=coin`;
  return cacheFetch({ url }, ttl)
    .then((res) => {
      return res ? res : [];
    })
    .catch((error) => {
      console.error("Failed to fetch activity:", error);
      return [];
    });
};

export default async (
  network: BaseNetwork,
  address: string
): Promise<Activity[]> => {
  const networkName = network.name as keyof typeof NetworkEndpoints;
  const enpoint = NetworkEndpoints[networkName];
  const ttl = NetworkTtls[networkName];

  const activityState = new ActivityState();
  const options = {
    address: address,
    network: network.name,
  };
  const allActivities = await activityState.getAllActivities(options);
  const lastActivity = allActivities[allActivities.length - 1] as any;
  const activities = await getAddressActivity(
    address,
    enpoint,
    ttl,
    lastActivity?.rawInfo?.height ?? 0
  );

  let price = "0";

  if (network.coingeckoID) {
    const marketData = new MarketData();
    await marketData
      .getTokenPrice(network.coingeckoID)
      .then((mdata) => (price = mdata || "0"));
  }

  const groupActivities = activities.reduce((acc: any, activity: any) => {
    if (!acc[activity.requestKey]) {
      acc[activity.requestKey] = activity;
    }
    if (activity.idx === 1) {
      acc[activity.requestKey] = activity;
    }
    return acc;
  }, {});

  return Object.values(groupActivities).map((activity: any, i: number) => {
    const rawAmount = toBase(
      activity.amount
        ? parseFloat(activity.amount).toFixed(network.decimals)
        : "0",
      network.decimals
    );
    // note: intentionally not using fromAccount === some-value
    // I want to match both null and "" in fromAccount/toAccount
    // actual values will be a (truthy) string
    let { fromAccount, toAccount } = activity;
    if (!fromAccount && activity.crossChainAccount) {
      fromAccount = activity.crossChainAccount;
    }
    if (!toAccount && activity.crossChainAccount) {
      toAccount = activity.crossChainAccount;
    }
    return {
      nonce: i.toString(),
      from: fromAccount,
      to: toAccount,
      isIncoming: activity.fromAccount !== address,
      network: network.name,
      rawInfo: activity,
      chainId: activity.chain.toString(),
      crossChainId: activity.crossChainId,
      status:
        activity.idx === 1 ? ActivityStatus.success : ActivityStatus.failed,
      timestamp: new Date(activity.blockTime).getTime(),
      value: rawAmount,
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
