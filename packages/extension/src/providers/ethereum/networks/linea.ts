import icon from './icons/linea.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import NFTHandler from '@/libs/nft-handlers/goldrush';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const lineaOptions: EvmNetworkOptions = {
  name: NetworkNames.Linea,
  name_long: 'Linea',
  homePage: 'https://linea.build/',
  blockExplorerTX: 'https://lineascan.build/tx/[[txHash]]',
  blockExplorerAddr: 'https://lineascan.build/address/[[address]]',
  chainID: `0xe708`,
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'https://rpc.linea.build',
  icon,
  coingeckoPlatform: CoingeckoPlatform.Linea,
  NFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const linea = new EvmNetwork(lineaOptions);

export default linea;
