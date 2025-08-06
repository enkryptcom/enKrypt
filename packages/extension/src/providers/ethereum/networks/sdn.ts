import icon from './icons/sdn.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const sdnOptions: EvmNetworkOptions = {
  name: NetworkNames.ShidenEVM,
  name_long: 'Shiden EVM',
  homePage: 'https://shiden.astar.network/',
  blockExplorerTX: 'https://blockscout.com/shiden/tx/[[txHash]]',
  blockExplorerAddr: 'https://blockscout.com/shiden/address/[[address]]',
  chainID: '0x150',
  isTestNetwork: false,
  currencyName: 'SDN',
  currencyNameLong: 'Shiden',
  node: 'wss://shiden.api.onfinality.io/public-ws',
  icon,
  coingeckoID: 'shiden',
  coingeckoPlatform: CoingeckoPlatform.Shiden,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const sdn = new EvmNetwork(sdnOptions);

export default sdn;
