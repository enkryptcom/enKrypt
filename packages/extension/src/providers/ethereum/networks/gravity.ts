import icon from './icons/gravity.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const gravityOptions: EvmNetworkOptions = {
  name: NetworkNames.Gravity,
  name_long: 'Gravity',
  homePage: 'https://gravity.xyz/',
  blockExplorerTX: 'https://explorer.gravity.xyz/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.gravity.xyz/address/[[address]]',
  chainID: '0x659',
  isTestNetwork: false,
  currencyName: 'G',
  currencyNameLong: 'G',
  coingeckoID: 'g-token',
  node: 'https://rpc.gravity.xyz',
  icon,
  coingeckoPlatform: CoingeckoPlatform.Gravity,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const gravity = new EvmNetwork(gravityOptions);

export default gravity;
