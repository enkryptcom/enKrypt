import icon from './icons/etc.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const etcOptions: EvmNetworkOptions = {
  name: NetworkNames.EthereumClassic,
  name_long: 'Ethereum Classic',
  homePage: 'https://ethereumclassic.org/',
  blockExplorerTX: 'https://blockscout.com/etc/mainnet/tx/[[txHash]]',
  blockExplorerAddr: 'https://blockscout.com/etc/mainnet/address/[[address]]',
  chainID: '0x3d',
  isTestNetwork: false,
  currencyName: 'ETC',
  currencyNameLong: 'Ethereum Classic',
  node: 'https://etc.rivet.link',
  icon,
  basePath: "m/44'/61'/0'/0",
  coingeckoID: 'ethereum-classic',
  coingeckoPlatform: CoingeckoPlatform.EthereumClassic,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const etc = new EvmNetwork(etcOptions);

export default etc;
