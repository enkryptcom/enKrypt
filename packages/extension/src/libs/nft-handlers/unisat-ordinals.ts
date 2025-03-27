import { NFTCollection, NFTItem, NFTType } from '@/types/nft';
import { NetworkNames } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import imgNotFound from '@action/assets/common/not-found.jpg';
import { getAllOrdinals } from '@/providers/bitcoin/libs/filter-ordinals';
export default async (
  network: BaseNetwork,
  address: string,
): Promise<NFTCollection[]> => {
  const supportedNetworks = {
    [NetworkNames.Bitcoin]: 'btc',
  };
  if (!Object.keys(supportedNetworks).includes(network.name))
    throw new Error('Unisat: network not supported');
  const allItems = await getAllOrdinals(
    network.displayAddress(address),
    network.name,
    [],
  );
  if (!allItems || !allItems.length) return [];
  const collections: Record<string, NFTCollection> = {};
  allItems.forEach(item => {
    const collectionName = 'Ordinals';
    const contractAddress = '1';
    if (!item.preview) return;
    if (collections[contractAddress]) {
      const tItem: NFTItem = {
        contract: item.inscriptionId,
        id: item.location,
        image: item.preview,
        name: `Ordinal #${item.inscriptionNumber}`,
        url: `https://ordinals.com/inscription/${item.inscriptionId}`,
        type: NFTType.Ordinals,
      };
      collections[contractAddress].items.push(tItem);
    } else {
      const ret: NFTCollection = {
        name: collectionName,
        description: '',
        image: imgNotFound,
        contract: contractAddress,
        items: [
          {
            contract: item.inscriptionId,
            id: item.location,
            image: item.preview,
            name: `Ordinal #${item.inscriptionNumber}`,
            url: `https://ordinals.com/inscription/${item.inscriptionId}`,
            type: NFTType.Ordinals,
          },
        ],
      };
      collections[contractAddress] = ret;
    }
  });
  return Object.values(collections);
};
