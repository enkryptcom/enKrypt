import icon from './icons/unitzero.webp';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { NetworkNames } from '@enkryptcom/types';
import { EtherscanActivity } from '../libs/activity-handlers';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';

const unitZeroTestnetOptions: EvmNetworkOptions = {
  name: NetworkNames.UnitZeroTestnet,
  name_long: 'Unit Zero Testnet',
  homePage: 'https://www.units.network/',
  blockExplorerTX: 'https://explorer-testnet.unit0.dev/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer-testnet.unit0.dev/address/[[address]]',
  chainID: '0x15af1',
  isTestNetwork: true,
  currencyName: 'UNIT0',
  currencyNameLong: 'Unit0',
  node: 'https://rpc-testnet.unit0.dev/',
  icon,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const unitZero = new EvmNetwork(unitZeroTestnetOptions);

export default unitZero;
