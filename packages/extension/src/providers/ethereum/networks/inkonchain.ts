import icon from './icons/ink.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const inkOptions: EvmNetworkOptions = {
  name: NetworkNames.Ink,
  name_long: 'Ink Onchain',
  homePage: 'https://inkonchain.com/',
  blockExplorerTX: 'https://explorer.inkonchain.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.inkonchain.com/address/[[address]]',
  chainID: '0xDEF1',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'ETH',
  node: 'https://rpc-gel.inkonchain.com',
  icon,
  coingeckoID: 'ethereum',
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const ink = new EvmNetwork(inkOptions);

export default ink;
