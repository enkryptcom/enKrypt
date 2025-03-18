import icon from './icons/aa.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const artheraOptions: EvmNetworkOptions = {
  name: NetworkNames.Arthera,
  name_long: 'Arthera',
  homePage: 'https://arthera.net/',
  blockExplorerTX: 'https://explorer.arthera.net/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.arthera.net/address/[[address]]',
  chainID: '0x2802',
  isTestNetwork: false,
  currencyName: 'AA',
  currencyNameLong: 'Arthera',
  node: 'https://rpc.arthera.net',
  icon,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const arthera = new EvmNetwork(artheraOptions);

export default arthera;
