import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import {
  MultiversXNetwork,
  MultiversXNetworkOptions,
} from '../types/mvx-network';
import icon from './icons/multiversx.webp';

const multiversxOptions: MultiversXNetworkOptions = {
  name: NetworkNames.MultiversX,
  name_long: 'MultiversX',
  homePage: 'https://multiversx.com/',
  blockExplorerTX: 'https://explorer.multiversx.com/transactions/[[txHash]]',
  blockExplorerAddr: 'https://explorer.multiversx.com/accounts/[[address]]',
  isTestNetwork: false,
  currencyName: 'EGLD',
  currencyNameLong: 'MultiversX',
  icon,
  decimals: 18,
  node: 'https://api.multiversx.com',
  coingeckoID: 'elrond',
  coingeckoPlatform: CoingeckoPlatform.MultiversX,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
  basePath: "m/44'/508'",
  assetsInfoHandler: async () => [],
};

const multiversx = new MultiversXNetwork(multiversxOptions);

export default multiversx;
