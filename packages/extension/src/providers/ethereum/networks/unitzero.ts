import icon from './icons/unitzero.webp';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EtherscanActivity } from '../libs/activity-handlers';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';


const unitZeroOptions: EvmNetworkOptions = {
  name: NetworkNames.UnitZero,
  name_long: 'Unit Zero',
  homePage: 'https://www.units.network/',
  blockExplorerTX: 'https://explorer.unit0.dev/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.unit0.dev/address/[[address]]',
  chainID: '0x15aeb',
  isTestNetwork: false,
  currencyName: 'UNIT0',
  currencyNameLong: 'Unit0',
  node: 'https://rpc.unit0.dev/',
  icon,
  coingeckoID: 'unit0',
  coingeckoPlatform: CoingeckoPlatform.UnitZero,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const unitZero = new EvmNetwork(unitZeroOptions);

export default unitZero;
