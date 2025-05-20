import icon from './icons/arbitrum.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import NFTHandler from '@/libs/nft-handlers/goldrush';

const arbOptions: EvmNetworkOptions = {
  name: NetworkNames.Arbitrum,
  name_long: 'Arbitrum',
  homePage: 'https://arbitrum.io/',
  blockExplorerTX: 'https://arbiscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://arbiscan.io/address/[[address]]',
  chainID: '0xa4b1',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'wss://nodes.mewapi.io/ws/arb',
  icon,
  coingeckoID: 'ethereum',
  coingeckoPlatform: CoingeckoPlatform.Arbitrum,
  assetsInfoHandler,
  NFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const arb = new EvmNetwork(arbOptions);

export default arb;
