import icon from './icons/mode.webp';
import { NetworkNames, CoingeckoPlatform } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const modeOptions: EvmNetworkOptions = {
  name: NetworkNames.Mode,
  name_long: 'Mode',
  homePage: 'https://www.mode.network/',
  blockExplorerTX: 'https://explorer.mode.network/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.mode.network/address/[[address]]',
  chainID: '0x868b',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'https://mainnet.mode.network',
  icon,
  coingeckoPlatform: CoingeckoPlatform.Mode,
  coingeckoID: 'ethereum',
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const mode = new EvmNetwork(modeOptions);

export default mode;
