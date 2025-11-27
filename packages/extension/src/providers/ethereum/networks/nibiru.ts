import icon from './icons/nibiru.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { RoutescanActivity } from '../libs/activity-handlers';

const nibiruOptions: EvmNetworkOptions = {
  name: NetworkNames.Nibiru,
  name_long: 'Nibiru',
  homePage: 'https://nibiru.fi',
  blockExplorerTX: 'https://nibiscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://nibiscan.io/address/[[address]]',
  chainID: '0x1AF4',
  isTestNetwork: false,
  currencyName: 'NIBI',
  currencyNameLong: 'Nibiru',
  node: 'https://evm-rpc.nibiru.fi',
  icon,
  coingeckoID: 'nibiru',
  coingeckoPlatform: CoingeckoPlatform.Nibiru,
  activityHandler: wrapActivityHandler(RoutescanActivity),
};

const nibiru = new EvmNetwork(nibiruOptions);

export default nibiru;
