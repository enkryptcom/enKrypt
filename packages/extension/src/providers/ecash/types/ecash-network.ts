import { BaseNetwork } from '@/types/base-network';
import { NetworkNames } from '@enkryptcom/types';
import { Activity } from '@/types/activity';
import { GasPriceTypes } from '@/providers/common/types';
import { ECashNetworkInfo } from '../types/ecash-chronik';
import { NFTCollection } from '@/types/nft';
import { Address } from 'ecash-lib';
import * as bitcoin from 'bitcoinjs-lib';
import { getAddressWithoutPrefix } from '../libs/utils';

export interface ECashNetworkOptions {
  name: NetworkNames;
  name_long: string;
  homePage: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  currencyName: string;
  currencyNameLong: string;
  icon: string;
  decimals: number;
  node: string;
  coingeckoID?: string;
  networkInfo: ECashNetworkInfo;
  dust: number;
  feeHandler: () => Promise<Record<GasPriceTypes, number>>;
  activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;
  NFTHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<NFTCollection[]>;
  cashAddrPrefix?: string;
}

export const getAddress = (pubkey: string): string => {
  if (pubkey.length < 64) return pubkey;

  try {
    let cleanPubkey = pubkey;
    if (pubkey.startsWith('0x') || pubkey.startsWith('0X')) {
      cleanPubkey = pubkey.slice(2);
    }

    const pubkeyBuffer = Buffer.from(cleanPubkey, 'hex');

    const pubkeyHash = bitcoin.crypto.hash160(pubkeyBuffer);

    const scriptHex = '76a914' + pubkeyHash.toString('hex') + '88ac';

    const address = Address.fromScriptHex(scriptHex);

    const addressWithoutPrefix = getAddressWithoutPrefix(address);

    return addressWithoutPrefix;
  } catch (error) {
    console.error('Error converting pubkey to cashaddr:', error);
    return pubkey;
  }
};
