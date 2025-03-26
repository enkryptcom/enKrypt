import { NFTCollection, NFTItem, NFTType } from '@/types/nft';
import { NodeType } from '@/types/provider';
import cacheFetch from '../cache-fetch';
import { NetworkNames } from '@enkryptcom/types';
import imgNotFound from '@action/assets/common/not-found.jpg';
import { HeliusNFTType, HeliusResponse } from './types/helius';
const HELIUS_ENDPOINT = 'https://nodes.mewapi.io/rpc/sol';
const CACHE_TTL = 60 * 1000;
export default async (
  network: NodeType,
  address: string,
): Promise<NFTCollection[]> => {
  const supportedNetworks = {
    [NetworkNames.Solana]: 'solana',
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error('helius: network not supported');
  let allItems: HeliusNFTType[] = [];
  const fetchAll = (continuation = 1): Promise<void> => {
    const query = {
      jsonrpc: '2.0',
      id: '1',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress: network.displayAddress(address),
        page: continuation,
        limit: 50,
        sortBy: {
          sortBy: 'created',
          sortDirection: 'asc',
        },
        options: {
          showUnverifiedCollections: false,
          showCollectionMetadata: true,
          showGrandTotal: false,
          showFungible: false,
          showNativeBalance: false,
          showInscription: true,
          showZeroBalance: true,
        },
      },
    };
    return cacheFetch(
      {
        url: HELIUS_ENDPOINT,
        post: query,
      },
      CACHE_TTL,
    ).then(json => {
      const items: HeliusNFTType[] = (json as HeliusResponse).result.items;
      allItems = allItems.concat(items);
      if (items.length) return fetchAll(++continuation);
    });
  };
  await fetchAll();
  if (!allItems || !allItems.length) return [];
  const collections: Record<string, NFTCollection> = {};
  allItems.forEach(item => {
    if (!item.content.files.length || !item.content.files[0].cdn_uri) return;
    if (item.interface !== 'V1_NFT') return;
    if (collections[item.id]) {
      const tItem: NFTItem = {
        contract: item.id,
        id: item.id,
        image: item.content.files[0].cdn_uri,
        name: item.content.metadata.name || item.content.metadata.symbol,
        url: `https://magiceden.io/item-details/${item.id}`,
        type: item.compression.compressed
          ? NFTType.SolanaBGUM
          : NFTType.SolanaToken,
      };
      collections[item.id].items.push(tItem);
    } else {
      const ret: NFTCollection = {
        name: item.content.metadata.name || item.content.metadata.symbol,
        description: item.content.metadata.description,
        image: item.content.files[0].cdn_uri || imgNotFound,
        contract: item.id,
        items: [
          {
            contract: item.id,
            id: item.id,
            image: item.content.files[0].cdn_uri,
            name: item.content.metadata.name || item.content.metadata.symbol,
            url: `https://magiceden.io/item-details/${item.id}`,
            type: item.compression.compressed
              ? NFTType.SolanaBGUM
              : NFTType.SolanaToken,
          },
        ],
      };
      collections[item.id] = ret;
    }
  });
  return Object.values(collections);
};
