import cacheFetch from '@/libs/cache-fetch';
import MarketData from '@/libs/market-data';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { NFTCollection, NFTItem, NFTType } from '@/types/nft';
import { NetworkEndpoint, NetworkTtl } from './configs';

const getAddressActivity = async (
  address: string,
  endpoint: string,
  ttl: number,
): Promise<any[]> => {
  const url = `${endpoint}/accounts/${address}/transactions`;
  return cacheFetch({ url }, ttl)
    .then(res => {
      return res ? res : [];
    })
    .catch(error => {
      console.error('Failed to fetch activity:', error);
      return [];
    });
};

export const multiversxScanActivity = async (
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
    let status = ActivityStatus.failed;
    if (activity.status === 'pending') {
      status = ActivityStatus.pending;
    } else if (activity.status === 'success') {
      status = ActivityStatus.success;
    }

    return {
      nonce: (activity.nonce || 0).toString(),
      from: activity.sender,
      to: activity.receiver,
      isIncoming: activity.sender !== address,
      network: network.name,
      rawInfo: activity,
      status,
      timestamp: activity.timestampMs,
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

const getAddressNfts = async (
  address: string,
  endpoint: string,
  ttl: number,
): Promise<any[]> => {
  const url = `${endpoint}/accounts/${address}/nfts?excludeMetaESDT=true&size=10000`;
  return cacheFetch({ url }, ttl)
    .then(res => {
      return res ? res : [];
    })
    .catch(error => {
      console.error('Failed to fetch NFTs:', error);
      return [];
    });
};

export const nftHandler = async (
  network: BaseNetwork,
  address: string,
): Promise<NFTCollection[]> => {
  const networkName = network.name as keyof typeof NetworkEndpoint;
  const enpoint = NetworkEndpoint[networkName];
  const ttl = NetworkTtl[networkName];

  const nfts = await getAddressNfts(address, enpoint, ttl);

  // Group NFTs by collection
  const collectionsMap: Record<string, NFTItem[]> = {};

  nfts.forEach(nft => {
    const item: NFTItem = {
      name: nft.name,
      id: nft.identifier,
      contract: '',
      image: nft.media[0]?.url ?? '',
      type: NFTType.MultiversXNFT,
      url: nft.url,
    };
    const collectionId = nft.collection;
    if (!collectionsMap[collectionId]) {
      collectionsMap[collectionId] = [];
    }
    collectionsMap[collectionId].push(item);
  });

  // Create NFTCollection objects
  const nftCollections: NFTCollection[] = Object.entries(collectionsMap).map(
    ([collectionId, items]) => ({
      name: collectionId,
      id: collectionId,
      items,
      type: NFTType.MultiversXNFT,
      image: items[0]?.image ?? '',
      description: '',
      contract: '',
    }),
  );

  return nftCollections;
};
