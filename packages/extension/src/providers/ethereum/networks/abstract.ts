import icon from './icons/abstract.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const absOptions: EvmNetworkOptions = {
  name: NetworkNames.Abstract,
  name_long: 'Abstract',
  homePage: 'https://www.abs.xyz/',
  blockExplorerTX: 'https://abscan.org/tx/[[txHash]]',
  blockExplorerAddr: 'https://abscan.org/address/[[address]]',
  chainID: '0xAB5',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'ETH',
  node: 'https://api.mainnet.abs.xyz',
  icon,
  coingeckoID: 'ethereum',
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const abstract = new EvmNetwork(absOptions);

export default abstract;
