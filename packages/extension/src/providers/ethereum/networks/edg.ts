import icon from './icons/edgeware.webp';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';

const edgOptions: EvmNetworkOptions = {
  name: NetworkNames.EdgeEVM,
  name_long: 'Edgeware EVM',
  homePage: 'https://www.edgeware.io/',
  blockExplorerTX: 'https://edgscan.live/tx/[[txHash]]',
  blockExplorerAddr: 'https://edgscan.live/address/[[address]]',
  chainID: '0x7e5',
  isTestNetwork: false,
  currencyName: 'EDG',
  currencyNameLong: 'Edgeware',
  node: 'wss://edgeware-rpc3.jelliedowl.net',
  icon,
  coingeckoID: 'edgeware',
  coingeckoPlatform: CoingeckoPlatform.Edgeware,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const edg = new EvmNetwork(edgOptions);

export default edg;
