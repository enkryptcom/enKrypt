import cacheFetch from "@/libs/cache-fetch";
import MarketData from "@/libs/market-data";
import { toBase } from "@enkryptcom/utils";
import {
  Activity,
  ActivityStatus,
  ActivityType,
  SubstrateRawInfo,
} from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { numberToHex } from "web3-utils";
import { NetworkEndpoints } from "./configs";
const TTL = 30000;
const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<SubstrateRawInfo[]> => {
  return cacheFetch(
    {
      url: `${endpoint}api/scan/transfers?address=${address}&row=50`,
    },
    TTL
  ).then((res) => {
    if (res.message !== "Success") return [];
    return res.data.transfers ? res.data.transfers : [];
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
  return activities.map((activity) => {
    return {
      from: activity.from,
      to: activity.to,
      isIncoming: activity.from !== address,
      network: network.name,
      rawInfo: activity,
      status: activity.success ? ActivityStatus.success : ActivityStatus.failed,
      timestamp: activity.block_timestamp * 1000,
      value: numberToHex(toBase(activity.amount, network.decimals)),
      transactionHash: activity.hash,
      type: ActivityType.transaction,
      token: {
        decimals: network.decimals,
        icon: network.icon,
        name: network.currencyNameLong,
        symbol:
          activity.asset_symbol !== ""
            ? activity.asset_symbol
            : network.currencyName,
        price: price,
      },
    };
  });
};
