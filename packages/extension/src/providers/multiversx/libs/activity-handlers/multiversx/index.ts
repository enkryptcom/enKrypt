import cacheFetch from '@/libs/cache-fetch';
import MarketData from '@/libs/market-data';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';
import { NFTCollection, NFTItem, NFTType } from '@/types/nft';
import { TokenComputer } from '@multiversx/sdk-core';
import { TransactionDecoder } from '@multiversx/sdk-transaction-decoder/lib/src/transaction.decoder';
import { NetworkEndpoint, NetworkTtl } from './configs';

const getAddressActivity = async (
  address: string,
  endpoint: string,
  ttl: number,
): Promise<any[]> => {
  const url = `${endpoint}/accounts/${address}/transactions?size=50`;
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
  const tokenComputer = new TokenComputer();
  const decoder = new TransactionDecoder();

  let egldPrice = '0';

  if (network.coingeckoID) {
    const marketData = new MarketData();
    await marketData
      .getTokenPrice(network.coingeckoID)
      .then(mdata => (egldPrice = mdata || '0'));
  }

  const allActivities: Activity[] = [];

  await Promise.all(
    activities.map(async (activity: any) => {
      let status = ActivityStatus.failed;
      if (activity.status === 'pending') {
        status = ActivityStatus.pending;
      } else if (activity.status === 'success') {
        status = ActivityStatus.success;
      }

      const metadata = decoder.getTransactionMetadata({
        sender: activity.sender,
        receiver: activity.receiver,
        data: activity.data,
        value: activity.value,
      });

      if (metadata.transfers?.length) {
        for (let i = 0; i < metadata.transfers.length; i++) {
          const tokenIdentifier =
            metadata.transfers[i].properties!.identifier ||
            metadata.transfers[i].properties!.token ||
            '';

          const tokenNonce =
            tokenComputer.extractNonceFromExtendedIdentifier(tokenIdentifier);
          let tokenDetails: any;
          let icon: string = '';
          let price: string = '0';

          if (tokenNonce === 0) {
            tokenDetails = await getFungibleTokenDetails(
              enpoint,
              tokenIdentifier,
              ttl,
            );

            icon = tokenDetails.assets?.pngUrl;
            price = tokenDetails.price?.toString();
          } else {
            tokenDetails = await getNFTTokenDetails(
              enpoint,
              tokenIdentifier,
              ttl,
            );

            icon = tokenDetails.media?.[0]?.thumbnailUrl || '';
          }

          const name = tokenDetails.name;
          const symbol = tokenDetails.identifier;
          allActivities.push({
            nonce: (activity.nonce || 0).toString(),
            from: metadata.sender,
            to: metadata.receiver,
            isIncoming: metadata.sender !== address,
            network: network.name,
            rawInfo: activity,
            status,
            timestamp: activity.timestampMs,
            value: metadata.transfers[i].value
              ? metadata.transfers[i].value.toString()
              : '',
            transactionHash: activity.txHash,
            type: ActivityType.transaction,
            token: {
              decimals: tokenDetails.decimals || 0,
              icon: icon,
              name: name,
              symbol: symbol,
              price: price,
            },
          });
        }
      } else {
        allActivities.push({
          nonce: (activity.nonce || 0).toString(),
          from: metadata.sender,
          to: metadata.receiver,
          isIncoming: metadata.sender !== address,
          network: network.name,
          rawInfo: activity,
          status,
          timestamp: activity.timestampMs,
          value: metadata.value ? metadata.value.toString() : '',
          transactionHash: activity.txHash,
          type: ActivityType.transaction,
          token: {
            decimals: network.decimals,
            icon: network.icon,
            name: network.currencyNameLong,
            symbol: network.currencyName,
            price: egldPrice,
          },
        });
      }
    }),
  );

  allActivities.sort((a, b) => b.timestamp - a.timestamp);
  return allActivities;
};

const getFungibleTokenDetails = async (
  endpoint: string,
  token: string,
  ttl: number,
): Promise<any[]> => {
  const url = `${endpoint}/tokens/${token}`;
  return cacheFetch({ url }, ttl)
    .then(res => {
      return res ? res : [];
    })
    .catch(error => {
      console.error('Failed to fetch fungible tokens:', error);
      return [];
    });
};

const getNFTTokenDetails = async (
  endpoint: string,
  token: string,
  ttl: number,
): Promise<any[]> => {
  const url = `${endpoint}/nfts/${token}`;
  return cacheFetch({ url }, ttl)
    .then(res => {
      return res ? res : [];
    })
    .catch(error => {
      console.error('Failed to fetch NFT:', error);
      return [];
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
