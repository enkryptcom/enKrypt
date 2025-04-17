import cacheFetch from '@/libs/cache-fetch';
import { HaskoinUnspentType } from '../types';
import { NetworkNames } from '@enkryptcom/types';

const OrdinalsEndpoint = 'https://partners.mewapi.io/ordinals/';
const CACHE_TTL = 60 * 1000;
const MAX_ITEMS = 100;

const supportedNetworks = [NetworkNames.Bitcoin];

interface OridnalType {
  inscriptionId: string;
  output: string;
  preview: string;
  inscriptionNumber: string;
  location: string;
}
export const getAllOrdinals = (
  address: string,
  networkName: string,
  currentItems: OridnalType[],
): Promise<OridnalType[]> => {
  const query = `${OrdinalsEndpoint}${networkName.toLowerCase()}/ordinals/inscriptions?address=${address}&cursor=${
    currentItems.length
  }&size=${MAX_ITEMS}`;
  return cacheFetch(
    {
      url: query,
    },
    CACHE_TTL,
  ).then(json => {
    if (json.code !== 0)
      throw Promise.reject('Unknown error, cant retrieve ordinals');
    const items: OridnalType[] = json.data.list as OridnalType[];
    currentItems = currentItems.concat(items);
    if (json.data.total === currentItems.length) return currentItems;
    return getAllOrdinals(address, networkName, currentItems);
  });
};

export const filterOutOrdinals = (
  address: string,
  networkName: string,
  utxos: HaskoinUnspentType[],
): Promise<HaskoinUnspentType[]> => {
  if (!supportedNetworks.includes(networkName as NetworkNames))
    return Promise.resolve(utxos);
  return getAllOrdinals(address, networkName, []).then(ordinals => {
    return utxos.filter(utxo => {
      for (const ord of ordinals) {
        const [txid, idx] = ord.output.split(':');
        if (utxo.txid === txid && utxo.index === parseInt(idx)) return false;
        if (utxo.value <= 1000) return false; // most likely ordinal, safety precaution
      }
      return true;
    });
  });
};
