import icon from './icons/sonic.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const sonicOptions: EvmNetworkOptions = {
  name: NetworkNames.Sonic,
  name_long: 'Sonic',
  homePage: 'https://www.soniclabs.com',
  blockExplorerTX: 'https://sonicscan.org/tx/[[txHash]]',
  blockExplorerAddr: 'https://sonicscan.org/address/[[address]]',
  chainID: '0x92',
  isTestNetwork: false,
  currencyName: 'S',
  currencyNameLong: 'Sonic',
  node: 'wss://rpc.soniclabs.com',
  icon,
  coingeckoID: 'sonic-3',
  coingeckoPlatform: CoingeckoPlatform.Sonic,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const sonic = new EvmNetwork(sonicOptions);

export default sonic;
