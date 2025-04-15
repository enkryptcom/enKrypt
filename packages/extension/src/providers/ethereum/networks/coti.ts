import icon from './icons/coti.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';

const coti: EvmNetworkOptions = {
  name: NetworkNames.Coti,
  name_long: 'COTI',
  homePage: 'https://coti.io/',
  blockExplorerTX: 'https://mainnet.cotiscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://mainnet.cotiscan.io/address/[[address]]',
  chainID: '0x282B34',
  isTestNetwork: false,
  currencyName: 'COTI',
  currencyNameLong: 'COTI',
  node: 'https://mainnet.coti.io/rpc',
  coingeckoID: 'coti',
  icon,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const cotiDevnet = new EvmNetwork(coti);

export default cotiDevnet;
