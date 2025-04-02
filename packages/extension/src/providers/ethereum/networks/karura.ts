import icon from './icons/karura-evm.webp';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EtherscanActivity } from '../libs/activity-handlers';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';

const karuraOptions: EvmNetworkOptions = {
  name: NetworkNames.KaruraEVM,
  name_long: 'Karura EVM',
  homePage: 'https://karura.network',
  blockExplorerTX: 'https://blockscout.karura.network/tx/[[txHash]]',
  blockExplorerAddr: 'https://blockscout.karura.network/address/[[address]]',
  chainID: '0x2ae',
  isTestNetwork: false,
  currencyName: 'KAR',
  currencyNameLong: 'Karura',
  node: 'wss://eth-rpc-karura.aca-api.network/ws',
  icon,
  coingeckoID: 'karura',
  coingeckoPlatform: CoingeckoPlatform.Karura,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const karura = new EvmNetwork(karuraOptions);

export default karura;
