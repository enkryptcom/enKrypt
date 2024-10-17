import { NFTCollection, NFTItem, NFTType } from '@/types/nft'
import cacheFetch from '../cache-fetch'
import { NetworkNames } from '@enkryptcom/types'
import { SHOrdinalsNFTType, SHOrdinalsResponse } from './types/simplehash'
import { BaseNetwork } from '@/types/base-network'
import imgNotFound from '@action/assets/common/not-found.jpg'
const SH_ENDPOINT = 'https://partners.mewapi.io/nfts/'
const CACHE_TTL = 1 * 1000
export default async (
  network: BaseNetwork,
  address: string,
): Promise<NFTCollection[]> => {
  const supportedNetworks = {
    [NetworkNames.Bitcoin]: 'bitcoin',
  }
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error('Simplehash: network not supported')
  let allItems: SHOrdinalsNFTType[] = []
  const fetchAll = (continuation?: string): Promise<void> => {
    const query = continuation
      ? continuation
      : `${SH_ENDPOINT}owners?chains=${
          supportedNetworks[network.name as keyof typeof supportedNetworks]
        }&wallet_addresses=${network.displayAddress(address)}`
    return cacheFetch(
      {
        url: query,
      },
      CACHE_TTL,
    ).then(json => {
      const items: SHOrdinalsNFTType[] = (json.result as SHOrdinalsResponse)
        .nfts
      allItems = allItems.concat(items)
      if (json.result.next) return fetchAll(json.result.next)
    })
  }
  await fetchAll()
  if (!allItems || !allItems.length) return []
  const collections: Record<string, NFTCollection> = {}
  allItems.forEach(item => {
    const collectionName =
      item.extra_metadata.ordinal_details.protocol_name === 'brc-20'
        ? 'BRC20'
        : item.collection.name
          ? item.collection.name
          : 'Unknown'
    const contractAddress =
      item.collection.collection_id || item.contract_address
    if (!item.image_url && !item.previews.image_medium_url) return
    if (!collectionName) return
    if (collections[contractAddress]) {
      const tItem: NFTItem = {
        contract: contractAddress,
        id: item.extra_metadata.ordinal_details.location,
        image: item.previews.image_medium_url,
        name: item.contract.name,
        url: `https://ordinals.com/inscription/${item.contract_address}`,
        type: NFTType.Ordinals,
      }
      collections[contractAddress].items.push(tItem)
    } else {
      const ret: NFTCollection = {
        name: collectionName,
        description: item.collection.description,
        image: item.collection.image_url || imgNotFound,
        contract: contractAddress,
        items: [
          {
            contract: contractAddress,
            id: item.extra_metadata.ordinal_details.location,
            image: item.image_url || item.previews.image_medium_url,
            name: item.contract.name,
            url: `https://ordinals.com/inscription/${item.contract_address}`,
            type: NFTType.Ordinals,
          },
        ],
      }
      collections[contractAddress] = ret
    }
  })
  return Object.values(collections)
}
