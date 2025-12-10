import icon from './icons/5ire.webp';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';

const fireOptions: EvmNetworkOptions = {
  name: NetworkNames.Fire,
  name_long: '5ire Chain',
  homePage: 'https://www.5ire.org',
  blockExplorerTX: 'https://5irescan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://5irescan.io/address/[[address]]',
  chainID: '0x3e3',
  isTestNetwork: false,
  currencyName: '5IRE',
  currencyNameLong: '5ire',
  node: 'https://rpc.5ire.network',
  icon,
  coingeckoID: '5ire',
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const fire = new EvmNetwork(fireOptions);

export default fire;
