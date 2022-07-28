import { NFTCollection, NFTItem } from "@/types/nft";
import { NodeType } from "@/types/provider";
import { NetworkNames } from "@enkryptcom/types";
import cacheFetch from "../cache-fetch";
import {
  ContentRepresentation,
  NFTContent,
  RaribleCollectionItem,
  RaribleItem,
} from "./types/rarible";
const RARIBLE_ENDPOINT = "https://api.rarible.org/v0.1/";
const ASSET_CACHE_TTL = 60 * 1000;
const COLLECTION_CACHE_TTL = 60 * 60 * 1000;
const setCollectionInfo = (
  collection: NFTCollection[]
): Promise<NFTCollection[]> => {
  const promises: Promise<RaribleCollectionItem>[] = [];
  collection.forEach((col) => {
    const promise = cacheFetch(
      {
        url: `${RARIBLE_ENDPOINT}collections/${col.name}`,
      },
      COLLECTION_CACHE_TTL
    ).then((json: RaribleCollectionItem) => json);
    promises.push(promise);
  });
  return Promise.all(promises).then((colInfo) => {
    colInfo.forEach((col, idx) => {
      collection[idx].name = col.name || "";
      collection[idx].description = col.meta.description || "";
      collection[idx].image = getBestImageURL(col.meta?.content || []);
    });
    return collection;
  });
};
const getBestImageURL = (content: NFTContent[]) => {
  const priority = [
    ContentRepresentation.PREVIEW,
    ContentRepresentation.BIG,
    ContentRepresentation.ORIGINAL,
  ];
  for (const pri of priority) {
    for (const cont of content) {
      if (
        cont.representation === pri &&
        !cont.url.includes("rarible.mypinata.cloud")
      )
        return cont.url;
    }
  }
  return "";
};
export default async (
  network: NodeType,
  address: string
): Promise<NFTCollection[]> => {
  const supportedNetworks: Record<string, string> = {
    [NetworkNames.Ethereum]: "ETHEREUM",
    [NetworkNames.Matic]: "POLYGON",
  };
  const URL_SUFFIX: Record<string, string> = {
    [NetworkNames.Ethereum]: "",
    [NetworkNames.Matic]: "polygon/",
  };

  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("RARIBLE: network not supported");
  let allItems: RaribleItem[] = [];
  const fetchAll = (continuation?: string): Promise<void> => {
    let query = `${RARIBLE_ENDPOINT}items/byOwner?size=1000&blockchains=${
      supportedNetworks[network.name]
    }&owner=ETHEREUM:${address}`;
    if (continuation) query += `&continuation=${continuation}`;
    return cacheFetch(
      {
        url: query,
      },
      ASSET_CACHE_TTL
    ).then((json) => {
      const items: RaribleItem[] = json.items;
      allItems = allItems.concat(items);
      if (json.continuation) return fetchAll(json.continuation);
    });
  };
  await fetchAll();
  const collection: Record<string, NFTItem[]> = {};
  allItems.forEach((item) => {
    if (!collection[item.collection]) collection[item.collection] = [];
    const newItem = {
      contract: item.contract.split(":")[1],
      id: item.tokenId,
      image: getBestImageURL(item.meta?.content || []),
      name: item.meta?.name || "",
      url: `https://rarible.com/token/${URL_SUFFIX[network.name]}${
        item.contract.split(":")[1]
      }:${item.tokenId}?ref=0x5bA9576c214FC7C6649f6F3C73dcbC2769b1761F`,
    };
    if (newItem.image && newItem.name)
      collection[item.collection].push(newItem);
  });
  const nftcollections: NFTCollection[] = [];
  for (const [id, items] of Object.entries(collection)) {
    nftcollections.push({
      name: id,
      description: "",
      image: "",
      items,
      contract: id.split(":")[1],
    });
  }
  await setCollectionInfo(nftcollections);
  const collections = nftcollections.filter(
    (col) => col.name && col.items.length
  );
  collections.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
  return collections;
};
