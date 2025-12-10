import icon from './icons/coti.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const cotiTestnetOptions: EvmNetworkOptions = {
  name: NetworkNames.CotiTestnet,
  name_long: 'COTI Testnet',
  homePage: 'https://coti.io/',
  blockExplorerTX: 'https://testnet.cotiscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://testnet.cotiscan.io/address/[[address]]',
  chainID: '0x6c11a0',
  isTestNetwork: true,
  currencyName: 'COTI',
  currencyNameLong: 'COTI Testnet',
  node: 'wss://testnet.coti.io/ws',
  icon,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const cotiTestnet = new EvmNetwork(cotiTestnetOptions);

export default cotiTestnet;
