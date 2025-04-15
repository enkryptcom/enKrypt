import icon from './icons/ham.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Ham,
  name_long: 'Ham Chain',
  homePage: 'https://ham.fun/',
  blockExplorerTX: 'https://explorer.ham.fun/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.ham.fun/address/[[address]]',
  chainID: '0x13f8',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'https://rpc.ham.fun',
  icon,
  coingeckoID: 'ethereum',
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const eth = new EvmNetwork(ethOptions);

export default eth;
