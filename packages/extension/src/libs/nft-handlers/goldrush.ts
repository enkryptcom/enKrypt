import { NFTCollection, NFTType } from '@/types/nft';
import { NodeType } from '@/types/provider';
import cacheFetch from '../cache-fetch';
import { NetworkNames } from '@enkryptcom/types';
import { GRNFTType, GRResponse } from './types/goldrush';
import imgNotFound from '@action/assets/common/not-found.jpg';
const GR_ENDPOINT = 'https://partners.mewapi.io/nftsv2/';
const CACHE_TTL = 60 * 1000;
const getExternalURL = (network: NodeType, contract: string, id: string) => {
  if (network.name === NetworkNames.Gnosis)
    return `https://niftyfair.io/gc/asset/${contract}/${id}/`;
  if (network.name === NetworkNames.Matic)
    return `https://rarible.com/token/polygon/${contract}:${id}`;
  if (network.name === NetworkNames.Arbitrum)
    return `https://rarible.com/token/arbitrum/${contract}:${id}`;
  if (network.name === NetworkNames.Base)
    return `https://rarible.com/token/base/${contract}:${id}`;
  return '';
};
export default async (
  network: NodeType,
  address: string,
): Promise<NFTCollection[]> => {
  const supportedNetworks = {
    [NetworkNames.Ethereum]: 'eth-mainnet',
    [NetworkNames.Matic]: 'matic-mainnet',
    [NetworkNames.Binance]: 'bsc-mainnet',
    [NetworkNames.Arbitrum]: 'arbitrum-mainnet',
    [NetworkNames.Optimism]: 'optimism-mainnet',
    [NetworkNames.Base]: 'base-mainnet',
    [NetworkNames.Linea]: 'linea-mainnet',
    [NetworkNames.Avalanche]: 'avalanche-mainnet',
    [NetworkNames.ZkSync]: 'zksync-mainnet',
    [NetworkNames.Gnosis]: 'gnosis-mainnet',
    [NetworkNames.Scroll]: 'scroll-mainnet',
    [NetworkNames.Bera]: 'berachain-mainnet',
    [NetworkNames.Unichain]: 'unichain-mainnet',
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error('Goldrush: network not supported');
  let allItems: GRNFTType[] = [];
  const fetchAll = (): Promise<void> => {
    const query = `${GR_ENDPOINT}${
      supportedNetworks[network.name as keyof typeof supportedNetworks]
    }/address/${address}/balances_nft/?no-spam=true&with-uncached=true`;
    return cacheFetch(
      {
        url: query,
      },
      CACHE_TTL,
    ).then(json => {
      const items: GRNFTType[] = (json as GRResponse).data.items;
      allItems = allItems.concat(items);
    });
  };
  await fetchAll();
  if (!allItems || !allItems.length) return [];
  const collections: Record<string, NFTCollection> = {};
  allItems.forEach(item => {
    if (
      !item.supports_erc.includes('erc1155') &&
      !item.supports_erc.includes('erc721')
    )
      return;
    const firstNftWithInfo = item.nft_data.find(
      nft =>
        !!nft.external_data &&
        !!nft.external_data.description &&
        !!nft.external_data.image,
    );
    if (!firstNftWithInfo) return;

    const ret: NFTCollection = {
      name: item.contract_name,
      description: firstNftWithInfo.external_data.description,
      image:
        firstNftWithInfo.external_data.image_512 ||
        firstNftWithInfo.external_data.image_256 ||
        firstNftWithInfo.external_data.image_1024 ||
        firstNftWithInfo.external_data.image ||
        imgNotFound,
      contract: item.contract_address,
      items: item.nft_data
        .filter(nft => nft.external_data)
        .map(nft => {
          return {
            contract: item.contract_address,
            id: nft.token_id,
            image:
              nft.external_data.image_512 ||
              nft.external_data.image_256 ||
              nft.external_data.image_1024 ||
              nft.external_data.image ||
              imgNotFound,
            name: nft.external_data.name,
            url: getExternalURL(network, item.contract_address, nft.token_id),
            type: item.supports_erc.includes('erc1155')
              ? NFTType.ERC1155
              : NFTType.ERC721,
          };
        }),
    };
    collections[item.contract_address] = ret;
  });
  return Object.values(collections);
};
