import icon from './icons/avax.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import NFTHandler from '@/libs/nft-handlers/goldrush';

const avaxOptions: EvmNetworkOptions = {
  name: NetworkNames.Avalanche,
  name_long: 'Avalanche C-Chain',
  homePage: 'https://www.avax.com/',
  blockExplorerTX: 'https://snowtrace.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://snowtrace.io/address/[[address]]',
  chainID: '0xa86a',
  isTestNetwork: false,
  currencyName: 'AVAX',
  currencyNameLong: 'Avalanche',
  node: 'https://api.avax.network/ext/bc/C/rpc',
  icon,
  coingeckoID: 'avalanche-2',
  coingeckoPlatform: CoingeckoPlatform.Avalanche,
  assetsInfoHandler,
  NFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const avax = new EvmNetwork(avaxOptions);

export default avax;
