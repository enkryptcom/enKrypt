import icon from './icons/arbitrum-nova.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const arbNovaOptions: EvmNetworkOptions = {
  name: NetworkNames.ArbitrumNova,
  name_long: 'Arbitrum Nova',
  homePage: 'https://arbitrum.io/',
  blockExplorerTX: 'https://nova.arbiscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://nova.arbiscan.io/address/[[address]]',
  chainID: '0xa4ba',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'https://nova.arbitrum.io/rpc',
  icon,
  coingeckoID: 'ethereum',
  coingeckoPlatform: CoingeckoPlatform.ArbitrumNova,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const arb = new EvmNetwork(arbNovaOptions);

export default arb;
