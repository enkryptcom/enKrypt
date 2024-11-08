import icon from './icons/eth.svg';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';

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
  activityHandler: () => Promise.resolve([]),
};

const holesky = new EvmNetwork(holeskyOptions);

export default holesky;
