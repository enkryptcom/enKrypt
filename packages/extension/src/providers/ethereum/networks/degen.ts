import icon from './icons/degen.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Degen,
  name_long: 'Degen',
  homePage: 'https://www.degen.tips/',
  blockExplorerTX: 'https://explorer.degen.tips/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.degen.tips/address/[[address]]',
  chainID: '0x27bc86aa',
  isTestNetwork: false,
  currencyName: 'DEGEN',
  currencyNameLong: 'DEGEN',
  node: 'https://rpc.degen.tips',
  icon,
  coingeckoID: 'degen-base',
  coingeckoPlatform: CoingeckoPlatform.Degen,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const eth = new EvmNetwork(ethOptions);

export default eth;
