import icon from './icons/rootstock.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import {
  toChecksumAddress,
  isValidChecksumAddress,
  isValidAddress,
} from '@ethereumjs/util';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const rootstockOptions: EvmNetworkOptions = {
  name: NetworkNames.Rootstock,
  name_long: NetworkNames.Rootstock,
  homePage: 'https://rsk.co/',
  blockExplorerTX: 'https://explorer.rsk.co/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.rsk.co/address/[[address]]',
  chainID: '0x1e',
  isTestNetwork: false,
  currencyName: 'RBTC',
  currencyNameLong: 'Rootstock',
  node: 'wss://nodes.mewapi.io/ws/rsk',
  icon,
  basePath: "m/44'/137'/0'/0",
  coingeckoID: CoingeckoPlatform.Rootstock,
  coingeckoPlatform: CoingeckoPlatform.Rootstock,
  activityHandler: wrapActivityHandler(EtherscanActivity),
  assetsInfoHandler,
};

rootstockOptions.displayAddress = (address: string) => {
  return toChecksumAddress(address, rootstockOptions.chainID);
};
rootstockOptions.isAddress = (address: string) => {
  return (
    isValidAddress(address) ||
    isValidChecksumAddress(address, rootstockOptions.chainID)
  );
};

const rootstock = new EvmNetwork(rootstockOptions);

export default rootstock;
