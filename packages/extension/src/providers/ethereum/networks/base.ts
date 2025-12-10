import icon from './icons/base.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import shNFTHandler from '@/libs/nft-handlers/goldrush';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const baseOptions: EvmNetworkOptions = {
  name: NetworkNames.Base,
  name_long: 'Base',
  homePage: 'https://base.org',
  blockExplorerTX: 'https://basescan.org/tx/[[txHash]]',
  blockExplorerAddr: 'https://basescan.org/address/[[address]]',
  chainID: '0x2105',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'wss://nodes.mewapi.io/ws/base',
  icon,
  coingeckoID: 'ethereum',
  coingeckoPlatform: CoingeckoPlatform.Base,
  NFTHandler: shNFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
  assetsInfoHandler,
};

const base = new EvmNetwork(baseOptions);

export default base;
