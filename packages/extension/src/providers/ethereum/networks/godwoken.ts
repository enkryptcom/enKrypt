import icon from './icons/godwoken.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import { GodwokenActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Godwoken,
  name_long: 'Godwoken',
  homePage: 'https://www.godwoken.com/',
  blockExplorerTX: 'https://v1.gwscan.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://v1.gwscan.com/address/[[address]]',
  chainID: '0x116ea',
  isTestNetwork: false,
  currencyName: 'CKB',
  currencyNameLong: 'CKByte',
  coingeckoID: 'nervos-network',
  node: 'https://v1.mainnet.godwoken.io/rpc',
  icon,
  coingeckoPlatform: CoingeckoPlatform.Godwoken,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(GodwokenActivity),
};

const eth = new EvmNetwork(ethOptions);

export default eth;
