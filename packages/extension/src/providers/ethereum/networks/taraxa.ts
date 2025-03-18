import icon from './icons/5ire.svg';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';

const taraxaOptions: EvmNetworkOptions = {
  name: NetworkNames.Taraxa,
  name_long: 'Taraxa',
  homePage: 'https://taraxa.io',
  blockExplorerTX: 'https://tara.to/tx/[[txHash]]',
  blockExplorerAddr: 'https://tara.to/address/[[address]]',
  chainID: '0x349',
  isTestNetwork: false,
  currencyName: 'TARA',
  currencyNameLong: 'Taraxa',
  node: 'https://rpc.mainnet.taraxa.io',
  coingeckoPlatform: CoingeckoPlatform.Taraxa,
  icon,
  coingeckoID: 'taraxa',
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const taraxa = new EvmNetwork(taraxaOptions);

export default taraxa;
