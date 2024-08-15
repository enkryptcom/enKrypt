import { NFTCollection, NFTItem, NFTType } from "@/types/nft";
import { NodeType } from "@/types/provider";
import cacheFetch from "../cache-fetch";
import { NetworkNames } from "@enkryptcom/types";
import { SHNFTType, SHResponse } from "./types/simplehash";
const SH_ENDPOINT = "https://partners.mewapi.io/nfts/";
const CACHE_TTL = 60 * 1000;
const getExternalURL = (network: NodeType, contract: string, id: string) => {
  if (network.name === NetworkNames.Gnosis)
    return `https://niftyfair.io/gc/asset/${contract}/${id}/`;
  return "";
};
export default async (
  network: NodeType,
  address: string
): Promise<NFTCollection[]> => {
  const supportedNetworks = {
    [NetworkNames.Optimism]: "optimism",
    [NetworkNames.Binance]: "bsc",
    [NetworkNames.Arbitrum]: "arbitrum",
    [NetworkNames.ArbitrumNova]: "arbitrum-nova",
    [NetworkNames.Gnosis]: "gnosis",
    [NetworkNames.Avalanche]: "avalanche",
    [NetworkNames.Matic]: "polygon",
    [NetworkNames.MaticZK]: "polygon-zkevm",
    [NetworkNames.ZkSync]: "zksync-era",
    [NetworkNames.ZkSyncGoerli]: "zksync-era-testnet",
    [NetworkNames.Base]: "base",
    [NetworkNames.Blast]: "blast",
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("Simplehash: network not supported");
  let allItems: SHNFTType[] = [];
  const fetchAll = (continuation?: string): Promise<void> => {
    const query = continuation
      ? continuation
      : `${SH_ENDPOINT}owners_v2?chains=${
          supportedNetworks[network.name as keyof typeof supportedNetworks]
        }&wallet_addresses=${address}&filters=spam_score__lte=75`;
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
    if (!item.image_url && !item.previews.image_medium_url) return;
    if (
      item.contract.type !== NFTType.ERC1155 &&
      item.contract.type !== NFTType.ERC721
    )
      return;
    if (collections[item.contract_address]) {
      const tItem: NFTItem = {
        contract: item.contract_address,
        id: item.token_id,
        image: item.image_url || item.previews.image_medium_url,
        name: item.name,
        url:
          item.external_url ||
          getExternalURL(network, item.contract_address, item.token_id),
        type: item.contract.type,
      };
      collections[item.contract_address].items.push(tItem);
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
            id: item.token_id,
            image: item.image_url || item.previews.image_medium_url,
            name: item.name,
            url:
              item.external_url ||
              getExternalURL(network, item.contract_address, item.token_id),
            type: item.contract.type,
          },
        ],
      };
      collections[item.contract_address] = ret;
    }
  });
  return Object.values(collections);
};
