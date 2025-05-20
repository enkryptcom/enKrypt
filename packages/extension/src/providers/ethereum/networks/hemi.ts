import icon from './icons/hemi.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const hemiOptions: EvmNetworkOptions = {
  name: NetworkNames.Hemi,
  name_long: 'Hemi',
  homePage: 'https://hemi.xyz/',
  blockExplorerTX: 'https://explorer.hemi.xyz/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.hemi.xyz/address/[[address]]',
  chainID: '0xa867',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'wss://rpc.hemi.network/wsrpc',
  coingeckoID: 'ethereum',
  icon,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const hemi = new EvmNetwork(hemiOptions);

export default hemi;
