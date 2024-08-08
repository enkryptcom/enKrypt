import { NFTCollection, NFTItem, NFTType } from "@/types/nft";
import { NodeType } from "@/types/provider";
import cacheFetch from "../cache-fetch";
import { NetworkNames } from "@enkryptcom/types";
import { SHNFTType, SHResponse, SHSolanaNFTType } from "./types/simplehash";
const SH_ENDPOINT = "https://partners.mewapi.io/nfts/";
const CACHE_TTL = 60 * 1000;
const SolanaTokenPrograms = {
  Bubblegum: "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
  Token: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
};
export default async (
  network: NodeType,
  address: string
): Promise<NFTCollection[]> => {
  const supportedNetworks = {
    [NetworkNames.Solana]: "solana",
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("Simplehash: network not supported");
  let allItems: SHSolanaNFTType[] = [];
  const fetchAll = (continuation?: string): Promise<void> => {
    const query = continuation
      ? continuation
      : `${SH_ENDPOINT}owners_v2?chains=${
          supportedNetworks[network.name as keyof typeof supportedNetworks]
        }&wallet_addresses=${network.displayAddress(
          address
        )}&filters=spam_score__lte=50`;
    return cacheFetch(
      {
        url: query,
      },
      CACHE_TTL
    ).then((json) => {
      const items: SHNFTType[] = (json.result as SHResponse).nfts;
      allItems = allItems.concat(items as SHSolanaNFTType[]);
      if (json.result.next) return fetchAll(json.result.next);
    });
  };
  await fetchAll();
  if (!allItems || !allItems.length) return [];
  const collections: Record<string, NFTCollection> = {};
  allItems.forEach((item) => {
    if (!item.image_url && !item.previews.image_medium_url) return;
    if (
      item.extra_metadata.token_program !== SolanaTokenPrograms.Bubblegum &&
      item.extra_metadata.token_program !== SolanaTokenPrograms.Token
    )
      return;
    if (collections[item.collection.collection_id]) {
      const tItem: NFTItem = {
        contract: item.contract_address,
        id: item.nft_id,
        image: item.image_url || item.previews.image_medium_url,
        name: item.name,
        url: item.collection.marketplace_pages.length
          ? item.collection.marketplace_pages[0].nft_url
          : `https://magiceden.io/item-details/${item.contract_address}`,
        type:
          item.extra_metadata.token_program === SolanaTokenPrograms.Bubblegum
            ? NFTType.SolanaBGUM
            : NFTType.SolanaToken,
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
            name: item.name,
            url: item.collection.marketplace_pages.length
              ? item.collection.marketplace_pages[0].nft_url
              : `https://magiceden.io/item-details/${item.contract_address}`,
            type:
              item.extra_metadata.token_program ===
              SolanaTokenPrograms.Bubblegum
                ? NFTType.SolanaBGUM
                : NFTType.SolanaToken,
          },
        ],
      };
      collections[item.collection.collection_id] = ret;
    }
  });
  return Object.values(collections);
};
