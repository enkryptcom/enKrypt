import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { multiversxScanActivity, nftHandler } from '../libs/activity-handlers';
import {
  MultiversXNetwork,
  MultiversXNetworkOptions,
  isValidAddress,
} from '../types/mvx-network';
import icon from './icons/multiversx.webp';

const multiversxOptions: MultiversXNetworkOptions = {
  name: NetworkNames.MultiversX,
  name_long: 'MultiversX',
  homePage: 'https://multiversx.com/',
  blockExplorerTX:
    'https://devnet-explorer.multiversx.com/transactions/[[txHash]]',
  blockExplorerAddr:
    'https://devnet-explorer.multiversx.com/accounts/[[address]]',
  isTestNetwork: false,
  currencyName: 'EGLD',
  currencyNameLong: 'MultiversX',
  icon,
  decimals: 18,
  node: 'https://devnet-api.multiversx.com',
  coingeckoID: 'elrond-erd-2',
  coingeckoPlatform: CoingeckoPlatform.MultiversX,
  activityHandler: wrapActivityHandler(multiversxScanActivity),
  basePath: "m/44'/508'",
  isAddress: isValidAddress,
  buyLink: 'https://buy.multiversx.com/',
  NFTHandler: nftHandler,
};

const multiversx = new MultiversXNetwork(multiversxOptions);

export default multiversx;
