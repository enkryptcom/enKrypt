import icon from './icons/coti.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const cotiDevnetOptions: EvmNetworkOptions = {
  name: NetworkNames.CotiDevnet,
  name_long: 'COTI Devnet',
  homePage: 'https://coti.io/',
  blockExplorerTX: 'https://explorer-devnet.coti.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer-devnet.coti.io/address/[[address]]',
  chainID: '0xc767a8',
  isTestNetwork: true,
  currencyName: 'COTI2',
  currencyNameLong: 'COTI2 Devnet',
  node: 'https://devnet.coti.io/rpc',
  icon,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const cotiDevnet = new EvmNetwork(cotiDevnetOptions);

export default cotiDevnet;
