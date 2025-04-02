import icon from './icons/eth.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const holeskyOptions: EvmNetworkOptions = {
  name: NetworkNames.Holesky,
  name_long: 'Holesky',
  homePage: 'https://holesky.dev/',
  blockExplorerTX: 'https://holesky.etherscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://holesky.etherscan.io/address/[[address]]',
  chainID: '0x4268',
  isTestNetwork: true,
  currencyName: 'HOL',
  currencyNameLong: 'Holesky',
  node: 'wss://nodes.mewapi.io/ws/holesky',
  icon,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const holesky = new EvmNetwork(holeskyOptions);

export default holesky;
