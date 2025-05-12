import icon from './icons/opbnb.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const opBnbOptions: EvmNetworkOptions = {
  name: NetworkNames.OpBNB,
  name_long: 'opBNB',
  homePage: 'https://opbnb.bnbchain.org/en',
  blockExplorerTX: 'https://opbnbscan.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://opbnbscan.com/address/[[address]]',
  chainID: '0xcc',
  isTestNetwork: false,
  currencyName: 'BNB',
  currencyNameLong: 'Binance Coin',
  node: 'wss://opbnb-rpc.publicnode.com',
  icon,
  coingeckoID: 'binancecoin',
  coingeckoPlatform: CoingeckoPlatform.OpBNB,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const op = new EvmNetwork(opBnbOptions);

export default op;
