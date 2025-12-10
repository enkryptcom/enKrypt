import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { NetworkNames } from '@enkryptcom/types';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';
import icon from './icons/conflux.png';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import NFTHandler from '@/libs/nft-handlers/conflux';

const confluxOptions: EvmNetworkOptions = {
  name: NetworkNames.Conflux,
  name_long: 'Conflux eSpace',
  homePage: 'https://confluxnetwork.org/',
  blockExplorerTX: 'https://evm.confluxscan.org/tx/[[txHash]]',
  blockExplorerAddr: 'https://evm.confluxscan.org/address/[[address]]',
  chainID: '0x406',
  isTestNetwork: false,
  currencyName: 'CFX',
  currencyNameLong: 'CFX',
  node: 'https://evm.confluxrpc.com',
  icon,
  NFTHandler,
  coingeckoID: 'conflux-token',
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const conflux = new EvmNetwork(confluxOptions);

export default conflux;
