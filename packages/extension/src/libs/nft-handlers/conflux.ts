import { NFTCollection, NFTType, NFTItem } from '@/types/nft';
import { NodeType } from '@/types/provider';
import cacheFetch from '../cache-fetch';
import { NetworkNames } from '@enkryptcom/types';
import {
  ConfluxResponse,
  ConfluxNFTItem,
  NFTBalanceItem,
  ListResponse,
  NFTItemWithDesc,
} from './types/conflux';

const CONFLUX_ENDPOINT = 'https://evmapi.confluxscan.org';
const CACHE_TTL = 60 * 1000;

// will fetch most 100 collections
// every collection will have most 100 items
export default async (
  network: NodeType,
  address: string,
): Promise<NFTCollection[]> => {
  if (network.name !== NetworkNames.Conflux)
    throw new Error('Conflux: network not supported');
  let allItems: NFTCollection[] = [];

  let nftBalances: ConfluxResponse = await cacheFetch(
    {
      url: `${CONFLUX_ENDPOINT}/nft/balances?owner=${address}&skip=0&limit=100`,
    },
    CACHE_TTL,
  );
  if (nftBalances.status !== '1' || nftBalances.result.total === 0) {
    return [];
  }

  for (let collection of nftBalances.result
    .list as unknown as NFTBalanceItem[]) {
    let contract = collection.contract;

    let items = await getCollectionItems(contract, address);
    if (!items.length) {
      continue;
    }

    let nftCollection: NFTCollection = {
      name: collection.name,
      image: collection.iconUrl || '',
      description: items[0].description,
      contract,
      items,
    };
    allItems.push(nftCollection);
  }

  return allItems;
};

async function getCollectionItems(
  contract: string,
  address: string,
): Promise<NFTItemWithDesc[]> {
  let itemResponse: ConfluxResponse = await cacheFetch(
    {
      url: `${CONFLUX_ENDPOINT}/nft/tokens?contract=${contract}&owner=${address}&skip=0&limit=100&withBrief=${true}&withMetadata=${true}&suppressMetadataError=${true}`,
    },
    CACHE_TTL,
  );

  if (itemResponse.status !== '1') {
    return [];
  }
  let items: ConfluxNFTItem[] = itemResponse.result
    .list as unknown as ConfluxNFTItem[];

  return items.map(item => ({
    name: item.name,
    id: item.tokenId,
    contract: item.contract,
    image: item.image,
    description: item.description,
    url: `https://evm.confluxscan.org/nft/${item.contract}/${item.tokenId}`,
    type: item.type === 'ERC721' ? NFTType.ERC721 : NFTType.ERC1155,
  }));
}
