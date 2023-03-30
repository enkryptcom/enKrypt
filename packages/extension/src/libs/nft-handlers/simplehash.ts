import { NFTCollection, NFTItem } from "@/types/nft";
import { NodeType } from "@/types/provider";
import cacheFetch from "../cache-fetch";
import { NetworkNames } from "@enkryptcom/types";
import { SHNFTType, SHResponse } from "./types/simplehash";
const SH_ENDPOINT = "https://partners.mewapi.io/nfts/";
const CACHE_TTL = 60 * 1000;
export default async (
  network: NodeType,
  address: string
): Promise<NFTCollection[]> => {
  const supportedNetworks = {
    [NetworkNames.Optimism]: "optimism",
    [NetworkNames.Binance]: "bsc",
    [NetworkNames.Arbitrum]: "arbitrum",
    [NetworkNames.Gnosis]: "gnosis",
    [NetworkNames.Avalanche]: "avalanche",
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("Simplehash: network not supported");
  let allItems: SHNFTType[] = [];
  const fetchAll = (continuation?: string): Promise<void> => {
    const query = continuation
      ? continuation
      : `${SH_ENDPOINT}owners?chains=${
          supportedNetworks[network.name as keyof typeof supportedNetworks]
        }&wallet_addresses=${address}`;
    return cacheFetch(
      {
        url: query,
      },
      CACHE_TTL
    ).then((json) => {
      const items: SHNFTType[] = (json.result as SHResponse).nfts;
      allItems = allItems.concat(items);
      if (json.result.next) return fetchAll(json.result.next);
    });
  };
  await fetchAll();
  if (!allItems || !allItems.length) return [];
  const collections: Record<string, NFTCollection> = {};
  allItems.forEach((item) => {
    if (!item.image_url || !item.collection.image_url) return;
    if (collections[item.contract_address]) {
      const tItem: NFTItem = {
        contract: item.contract_address,
        id: item.token_id,
        image: item.image_url,
        name: item.name,
        url: item.external_url,
      };
      collections[item.contract_address].items.push(tItem);
    } else {
      const ret: NFTCollection = {
        name: item.collection.name,
        description: item.collection.description,
        image: item.collection.image_url,
        contract: item.contract_address,
        items: [
          {
            contract: item.contract_address,
            id: item.token_id,
            image: item.image_url,
            name: item.name,
            url: item.external_url,
          },
        ],
      };
      collections[item.contract_address] = ret;
    }
  });
  return Object.values(collections);
};
