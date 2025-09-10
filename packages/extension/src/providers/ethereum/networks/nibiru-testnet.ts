import icon from './icons/nibiru.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { RoutescanActivity } from '../libs/activity-handlers';

const nibiruTestnetOptions: EvmNetworkOptions = {
  name: NetworkNames.NibiruTestnet,
  name_long: 'Nibiru Testnet',
  homePage: 'https://nibiru.fi',
  blockExplorerTX: 'https://testnet.nibiscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://testnet.nibiscan.io/address/[[address]]',
  chainID: '0x1AFF',
  isTestNetwork: true,
  currencyName: 'NIBI',
  currencyNameLong: 'Nibiru',
  node: 'https://evm-rpc.testnet-2.nibiru.fi',
  icon,
  activityHandler: wrapActivityHandler(RoutescanActivity),
};

const nibiruTestnet = new EvmNetwork(nibiruTestnetOptions);

export default nibiruTestnet;
