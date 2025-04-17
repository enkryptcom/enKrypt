import icon from './icons/matic.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const maticOptions: EvmNetworkOptions = {
  name: NetworkNames.MaticZK,
  name_long: 'Polygon | zkEVM',
  homePage: 'https://zkevm.polygonscan.com/',
  blockExplorerTX: 'https://zkevm.polygonscan.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://zkevm.polygonscan.com/address/[[address]]',
  chainID: '0x44d',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'wss://nodes.mewapi.io/ws/maticzk',
  icon,
  coingeckoID: 'ethereum',
  coingeckoPlatform: CoingeckoPlatform.MaticZK,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const matic = new EvmNetwork(maticOptions);

export default matic;
