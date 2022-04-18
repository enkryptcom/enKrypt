import { NFTCollection, NFTItem } from "@/types/nft";
import { NodeType } from "@/types/provider";
import {
  ContentRepresentation,
  NFTContent,
  RaribleCollectionItem,
  RaribleItem,
} from "./types/rarible";
const RARIBLE_ENDPOINT = "https://api.rarible.org/v0.1/";
const setCollectionInfo = (
  collection: NFTCollection[]
): Promise<NFTCollection[]> => {
  const promises: Promise<RaribleCollectionItem>[] = [];
  collection.forEach((col) => {
    const promise = fetch(`${RARIBLE_ENDPOINT}collections/${col.name}`)
      .then((res) => res.json())
      .then((json: RaribleCollectionItem) => json);
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
    ETH: "ETHEREUM",
    MATIC: "POLYGON",
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error("RARIBLE: network not supported");
  let allItems: RaribleItem[] = [];
  const fetchAll = (continuation?: string): Promise<void> => {
    let query = `${RARIBLE_ENDPOINT}items/byOwner?size=1000&blockchains=${
      supportedNetworks[network.name]
    }&owner=ETHEREUM:${address}`;
    if (continuation) query += `&continuation=${continuation}`;
    return fetch(query)
      .then((res) => res.json())
      .then((json) => {
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
      collection: item.collection,
      contract: item.contract.split(":")[1],
      id: item.tokenId,
      image: getBestImageURL(item.meta?.content || []),
      name: item.meta?.name || "",
      valueUSD: item.bestBidOrder ? item.bestBidOrder.takePriceUsd : "0",
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
    });
  }
  await setCollectionInfo(nftcollections);
  return nftcollections.filter((col) => col.name && col.items.length);
};
