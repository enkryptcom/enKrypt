import icon from './icons/zcd.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const zcdOptions: EvmNetworkOptions = {
  name: NetworkNames.ZChains,
  name_long: 'ZChains',
  homePage: 'https://www.zchains.com',
  blockExplorerTX: 'https://scan.zchains.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://scan.zchains.com/address/[[address]]',
  chainID: '0x290e8',
  isTestNetwork: false,
  currencyName: 'ZCD',
  currencyNameLong: 'ZChains',
  node: 'https://rpc.zchains.com',
  icon,
  coingeckoID: 'zchains',
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const zcd = new EvmNetwork(zcdOptions);

export default zcd;
