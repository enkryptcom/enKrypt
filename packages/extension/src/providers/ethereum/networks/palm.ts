import icon from './icons/palm.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

// Palm network has an API but it seems broken (DNS won't resolve)
// @see https://palm.chainlens.com/api/swagger-ui/index.html
// https://palm.epirus.io/api
const palmNetworkOptions: EvmNetworkOptions = {
  name: NetworkNames.Palm,
  name_long: 'Palm Network',
  homePage: 'https://palm.network/',
  blockExplorerTX: 'https://palm.chainlens.com/transactions/tx/[[txHash]]',
  blockExplorerAddr: 'https://palm.chainlens.com/accounts/address/[[address]]',
  chainID: '0x2a15c308d',
  isTestNetwork: false,
  currencyName: 'PALM',
  currencyNameLong: 'PALM',
  node: 'https://palm-mainnet.public.blastapi.io',
  icon,
  coingeckoID: 'palm-ai',
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const palmNetwork = new EvmNetwork(palmNetworkOptions);

export default palmNetwork;
