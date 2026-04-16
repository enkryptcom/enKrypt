import { NFTCollection, NFTItem, NFTType } from '@/types/nft';
import { BlockscoutNFTItem } from '@/libs/nft-handlers/types/blockscout';
import { NodeType } from '@/types/provider';
import Networks from '@/providers/ethereum/networks';
import cacheFetch from '../cache-fetch';
import { ethers, Contract } from 'ethers';
const ROOTSTOCK_RPC_NODE = 'https://public-node.rsk.co';
const ERC721_METADATA_ABI = [
  'function contractURI() view returns (string)'
];
const BLOCKSCOUT_ENDPOINT = 'https://rootstock.blockscout.com/api/v2/addresses';
const IPFS_ENDPOINT = 'https://ipfs.io/ipfs';
const CACHE_TTL = 60 * 1000;
const getAssetURL = (uri: string) => {
  if (uri && uri.startsWith('ipfs://')) {
    return `${IPFS_ENDPOINT}/${uri.slice(7)}`;
  }

  return uri;
};
const fetchNftCollectionDescription = async (network: NodeType, contractAddress: string): Promise<string | null> => {
  try {
    const supportedNetworks = [Networks.rootstock.name];
    if (!supportedNetworks.includes(network.name)) {
      return null;
    }
    const provider = new ethers.providers.JsonRpcProvider(ROOTSTOCK_RPC_NODE);
    const contract = new Contract(contractAddress.toLowerCase(), ERC721_METADATA_ABI, provider);
    const uri = await contract.contractURI();
    const httpUrl = getAssetURL(uri);
    const response = await fetch(httpUrl);
    if (!response.ok) {
      return null;
    }
    const metadata = await response.json();
    return metadata.description;
  } catch {
    return null;
  }
}
export default async (
  network: NodeType,
  address: string,
): Promise<NFTCollection[]> => {
  const supportedNetworks = [Networks.rootstock.name];
  if (!supportedNetworks.includes(network.name))
    throw new Error('Blockscout: network not supported');
  const fetchAll = (): Promise<BlockscoutNFTItem[]> => {
    const query = `${BLOCKSCOUT_ENDPOINT}/${address}/nft/collections?type=ERC-721`;
    return cacheFetch({ url: query }, CACHE_TTL).then(json => {
      return json.items as BlockscoutNFTItem[];
    });
  };
  const allItems = await fetchAll();
  if (!allItems || !allItems.length) return [];
  return Promise.all(allItems.map(async item => {
    const ret: NFTCollection = {
      name: item.token.name ?? 'Unnamed token',
      description: await fetchNftCollectionDescription(network, item.token.address_hash),
      image: item.token?.icon_url,
      contract: item.token.address_hash,
      items: item.token_instances.map(asset => {
        const retAsset: NFTItem = {
          contract: item.token.address_hash,
          id: asset.id,
          image: getAssetURL(asset.media_url),
          name: asset?.metadata?.name ?? 'Unnamed NFT asset',
          url: `https://rootstock.blockscout.com/token/${item.token.address_hash}/instance/${asset.id}`,
          type: NFTType.ERC721,
        };
        return retAsset;
      }),
    };
    return ret;
  }));
};
