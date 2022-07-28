import { NFTCollection, NFTItem } from "@/types/nft";
import { NodeType } from "@/types/provider";
import Networks from "@/providers/ethereum/networks";
import {
  ContentRepresentation,
  ContentURL,
  NFTCollection as MEWNFTCollection,
} from "./types/mew";
import cacheFetch from "../cache-fetch";
const MEW_ENDPOINT = "https://mainnet.mewwallet.dev/v3/";
const CACHE_TTL = 60 * 1000;
const getBestImageURL = (content: ContentURL[]) => {
  const priority = [ContentRepresentation.IMAGE];
  for (const pri of priority) {
    for (const cont of content) {
      if (cont.type === pri) return cont.url;
    }
  }
  return "";
};
export default async (
  network: NodeType,
  address: string
): Promise<NFTCollection[]> => {
  const supportedNetworks = [Networks.ethereum.name];
  if (!supportedNetworks.includes(network.name))
    throw new Error("MEW: network not supported");
  const fetchAll = (): Promise<MEWNFTCollection[]> => {
    const query = `${MEW_ENDPOINT}nfts/account?address=${address}`;
    return cacheFetch({ url: query }, CACHE_TTL).then((json) => {
      return json as MEWNFTCollection[];
    });
  };
  const allItems = await fetchAll();
  if (!allItems || !allItems.length) return [];
  return allItems.map((item) => {
    const ret: NFTCollection = {
      name: item.name,
      description: item.description,
      image: item.image,
      contract: item.contract_address,
      items: item.assets.map((asset) => {
        const retAsset: NFTItem = {
          contract: item.contract_address,
          id: asset.token_id,
          image: getBestImageURL(asset.urls),
          name: asset.name,
          url: `https://rarible.com/token/${item.contract_address}:${asset.token_id}?ref=0x5bA9576c214FC7C6649f6F3C73dcbC2769b1761F`,
        };
        return retAsset;
      }),
    };
    return ret;
  });
};
