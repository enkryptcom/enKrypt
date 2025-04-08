import icon from './icons/xlayer.webp';
import { NetworkNames, CoingeckoPlatform } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const xlayerOptions: EvmNetworkOptions = {
  name: NetworkNames.XLayer,
  name_long: 'X Layer',
  homePage: 'https://www.okx.com/xlayer',
  blockExplorerTX: 'https://www.okx.com/web3/explorer/xlayer/tx/[[txHash]]',
  blockExplorerAddr:
    'https://www.okx.com/web3/explorer/xlayer/address/[[address]]',
  chainID: '0xc4',
  isTestNetwork: false,
  currencyName: 'OKB',
  currencyNameLong: 'OKB',
  node: 'wss://ws.xlayer.tech',
  icon,
  coingeckoID: 'okb',
  coingeckoPlatform: CoingeckoPlatform.XLayer,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const xlayer = new EvmNetwork(xlayerOptions);

export default xlayer;
