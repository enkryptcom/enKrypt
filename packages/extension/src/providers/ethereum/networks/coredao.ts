import icon from './icons/coredao.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const coredaoOptions: EvmNetworkOptions = {
  name: NetworkNames.CoreDAO,
  name_long: 'CoreDAO',
  homePage: 'https://coredao.org',
  blockExplorerTX: 'https://scan.coredao.org/tx/[[txHash]]',
  blockExplorerAddr: 'https://scan.coredao.org/address/[[address]]',
  chainID: '0x45c',
  isTestNetwork: false,
  currencyName: 'CORE',
  currencyNameLong: 'Core',
  node: 'https://rpc.coredao.org',
  icon,
  coingeckoID: 'coredaoorg',
  coingeckoPlatform: CoingeckoPlatform.CoreDAO,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const coredao = new EvmNetwork(coredaoOptions);

export default coredao;
