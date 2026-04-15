import icon from './icons/telos.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const telosOptions: EvmNetworkOptions = {
  name: NetworkNames.Telos,
  name_long: 'Telos EVM',
  homePage: 'https://www.telos.net',
  blockExplorerTX: 'https://www.teloscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://www.teloscan.io/address/[[address]]',
  chainID: '0x28',
  isTestNetwork: false,
  currencyName: 'TLOS',
  currencyNameLong: 'Telos',
  node: 'https://rpc.telos.net',
  icon,
  coingeckoID: 'telos',
  coingeckoPlatform: CoingeckoPlatform.Telos,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const tlos = new EvmNetwork(telosOptions);

export default tlos;
