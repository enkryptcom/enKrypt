import { NFTCollection, NFTItem } from "@/types/nft";
import cacheFetch from "../cache-fetch";
import { NetworkNames } from "@enkryptcom/types";
import { SHOrdinalsNFTType, SHOrdinalsResponse } from "./types/simplehash";
import { BaseNetwork } from "@/types/base-network";
const SH_ENDPOINT = "https://partners.mewapi.io/nfts/";
const CACHE_TTL = 60 * 1000;
export default async (
  network: BaseNetwork,
  address: string
): Promise<NFTCollection[]> => {
  const supportedNetworks = {
    [NetworkNames.Bitcoin]: "bitcoin",
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("Simplehash: network not supported");
  let allItems: SHOrdinalsNFTType[] = [];
  const fetchAll = (continuation?: string): Promise<void> => {
    const query = continuation
      ? continuation
      : `${SH_ENDPOINT}owners?chains=${
          supportedNetworks[network.name as keyof typeof supportedNetworks]
        }&wallet_addresses=${network.displayAddress(address)}`;
    return cacheFetch(
      {
        url: query,
      },
      CACHE_TTL
    ).then((json) => {
      const items: SHOrdinalsNFTType[] = (json.result as SHOrdinalsResponse)
        .nfts;
      allItems = allItems.concat(items);
      if (json.result.next) return fetchAll(json.result.next);
    });
  };
  await fetchAll();
  if (!allItems || !allItems.length) return [];
  const collections: Record<string, NFTCollection> = {};
  allItems.forEach((item) => {
    if (!item.image_url && !item.previews.image_medium_url) return;
    if (!item.collection.name) return;
    if (collections[item.collection.collection_id]) {
      console.log(item);
      const tItem: NFTItem = {
        contract: item.contract_address,
        id: item.extra_metadata.ordinal_details.location,
        image: item.previews.image_medium_url,
        name: item.contract.name,
        url: `https://ordinals.com/inscription/${item.contract_address}`,
      };
      collections[item.collection.collection_id].items.push(tItem);
    } else {
      const ret: NFTCollection = {
        name: item.collection.name,
        description: item.collection.description,
        image:
          item.collection.image_url ||
          require("@action/assets/common/not-found.jpg"),
        contract: item.contract_address,
        items: [
          {
            contract: item.contract_address,
            id: item.nft_id,
            image: item.image_url || item.previews.image_medium_url,
            name: item.contract.name,
            url: `https://ordinals.com/inscription/${item.contract_address}`,
          },
        ],
      };
      collections[item.collection.collection_id] = ret;
    }
  });
  return Object.values(collections);
};
