import icon from './icons/5ire.svg';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EtherscanActivity } from '../libs/activity-handlers';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const fireOptions: EvmNetworkOptions = {
  name: NetworkNames.Fire,
  name_long: '5ireChain',
  homePage: 'https://www.5ire.org',
  blockExplorerTX: 'https://5irescan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://5irescan.io/address/[[address]]',
  chainID: '0x3e3',
  isTestNetwork: false,
  currencyName: '5IRE',
  currencyNameLong: '5ire',
  node: 'https://rpc.5ire.network',
  icon,
  coingeckoID: '5ire',
  coingeckoPlatform: CoingeckoPlatform.Fire,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const fire = new EvmNetwork(fireOptions);

export default fire;



