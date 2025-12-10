import icon from './icons/manta-pacific.webp';
import { NetworkNames, CoingeckoPlatform } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const mantaPacificOptions: EvmNetworkOptions = {
  name: NetworkNames.MantaPacific,
  name_long: 'Manta Pacific',
  homePage: 'https://pacific-info.manta.network/',
  blockExplorerTX: 'https://pacific-explorer.manta.network/tx/[[txHash]]',
  blockExplorerAddr:
    'https://pacific-explorer.manta.network/address/[[address]]',
  chainID: '0xa9',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  coingeckoID: 'ethereum',
  node: 'wss://pacific-rpc.manta.network/ws',
  icon,
  coingeckoPlatform: CoingeckoPlatform.MantaPacific,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const mantapacific = new EvmNetwork(mantaPacificOptions);

export default mantapacific;
