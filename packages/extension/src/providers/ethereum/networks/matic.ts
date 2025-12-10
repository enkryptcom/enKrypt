import icon from './icons/matic.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import NFTHandler from '@/libs/nft-handlers/goldrush';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const maticOptions: EvmNetworkOptions = {
  name: NetworkNames.Matic,
  name_long: 'Polygon',
  homePage: 'https://polygonscan.com/',
  blockExplorerTX: 'https://polygonscan.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://polygonscan.com/address/[[address]]',
  chainID: '0x89',
  isTestNetwork: false,
  currencyName: 'POL',
  currencyNameLong: 'Polygon POL',
  node: 'wss://nodes.mewapi.io/ws/matic',
  icon,
  coingeckoID: 'polygon-ecosystem-token',
  coingeckoPlatform: CoingeckoPlatform.Matic,
  NFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const matic = new EvmNetwork(maticOptions);

export default matic;
