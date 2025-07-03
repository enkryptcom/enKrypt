import cacheFetch from '@/libs/cache-fetch';
import MarketData from '@/libs/market-data';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { NetworkEndpoint, NetworkTtl } from './configs';

const getAddressActivity = async (
  address: string,
  endpoint: string,
  ttl: number,
): Promise<any[]> => {
  const url = `${endpoint}/accounts/${address}/transactions?token=EGLD`;
  return cacheFetch({ url }, ttl)
    .then(res => {
      return res ? res : [];
    })
    .catch(error => {
      console.error('Failed to fetch activity:', error);
      return [];
    });
};

export default async (
  network: BaseNetwork,
  address: string,
): Promise<Activity[]> => {
  const networkName = network.name as keyof typeof NetworkEndpoint;
  const enpoint = NetworkEndpoint[networkName];
  const ttl = NetworkTtl[networkName];
  const activities = await getAddressActivity(address, enpoint, ttl);

  let price = '0';

  if (network.coingeckoID) {
    const marketData = new MarketData();
    await marketData
      .getTokenPrice(network.coingeckoID)
      .then(mdata => (price = mdata || '0'));
  }

  return Object.values(activities).map((activity: any) => {
    return {
      nonce: activity.nonce,
      from: activity.sender,
      to: activity.receiver,
      isIncoming: activity.sender !== address,
      network: network.name,
      rawInfo: activity,
      status:
        activity.status === 'success'
          ? ActivityStatus.success
          : ActivityStatus.failed,
      timestamp: activity.timestamp,
      value: activity.value,
      transactionHash: activity.txHash,
      type: ActivityType.transaction,
      token: {
        decimals: network.decimals,
        icon: network.icon,
        name: network.currencyNameLong,
        symbol: network.currencyName,
        price: price,
      },
    };
  });
};
