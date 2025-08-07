import icon from './icons/eth.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const hoodiOptions: EvmNetworkOptions = {
  name: NetworkNames.Hoodi,
  name_long: 'Hoodi',
  homePage: 'https://hoodi.ethpandaops.io',
  blockExplorerTX: 'https://hoodi.etherscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://hoodi.etherscan.io/address/[[address]]',
  chainID: '0x88bb0',
  isTestNetwork: true,
  currencyName: 'HodETH',
  currencyNameLong: 'Hoodi ETH',
  node: 'wss://nodes.mewapi.io/ws/hoodi',
  icon,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const hoodi = new EvmNetwork(hoodiOptions);

export default hoodi;
