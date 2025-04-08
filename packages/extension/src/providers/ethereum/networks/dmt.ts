import icon from './icons/sanko.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Sanko,
  name_long: 'Sanko',
  homePage: 'https://sanko.xyz',
  blockExplorerTX: 'https://explorer.sanko.xyz/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.sanko.xyz/address/[[address]]',
  chainID: '0x7cc',
  isTestNetwork: false,
  currencyName: 'DMT',
  currencyNameLong: 'DMT',
  node: 'https://mainnet.sanko.xyz',
  icon,
  coingeckoID: 'dream-machine-token',
  coingeckoPlatform: CoingeckoPlatform.Sanko,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const eth = new EvmNetwork(ethOptions);

export default eth;
