import icon from './icons/kaia.png';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const kaiaOptions: EvmNetworkOptions = {
  name: NetworkNames.Kaia,
  name_long: 'Kaia',
  homePage: 'https://www.kaia.io/',
  blockExplorerTX: 'https://kaiascan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://kaiascan.io/address/[[address]]',
  chainID: '0x2019',
  isTestNetwork: false,
  currencyName: 'KAIA',
  currencyNameLong: 'Kaia',
  node: 'https://kaia.blockpi.network/v1/rpc/public',
  icon,
  coingeckoID: 'kaia',
  coingeckoPlatform: CoingeckoPlatform.Kaia,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const kaia = new EvmNetwork(kaiaOptions);

export default kaia;
