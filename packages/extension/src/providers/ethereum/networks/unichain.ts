import icon from './icons/unichain.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import NFTHandler from '@/libs/nft-handlers/goldrush';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const unchainOptions: EvmNetworkOptions = {
  name: NetworkNames.Unichain,
  name_long: 'Unichain',
  homePage: 'https://www.unichain.org/',
  blockExplorerTX: 'https://uniscan.xyz/tx/[[txHash]]',
  blockExplorerAddr: 'https://uniscan.xyz/address/[[address]]',
  chainID: '0x82',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'ETH',
  node: 'https://mainnet.unichain.org',
  icon,
  coingeckoID: 'ethereum',
  NFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const unchain = new EvmNetwork(unchainOptions);

export default unchain;
