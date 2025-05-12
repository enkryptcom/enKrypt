import icon from './icons/scroll.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import NFTHandler from '@/libs/nft-handlers/goldrush';

const scrollOptions: EvmNetworkOptions = {
  name: NetworkNames.Scroll,
  name_long: 'Scroll',
  homePage: 'https://scroll.io/',
  blockExplorerTX: 'https://scrollscan.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://scrollscan.com/address/[[address]]',
  chainID: '0x82750',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Scroll ETH',
  node: 'wss://scroll-rpc.publicnode.com',
  icon,
  NFTHandler,
  coingeckoID: 'ethereum',
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const scroll = new EvmNetwork(scrollOptions);

export default scroll;
