import icon from './icons/tac.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.TAC,
  name_long: 'TAC',
  homePage: 'https://tac.build',
  blockExplorerTX: 'https://explorer.tac.build/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.tac.build/address/[[address]]',
  chainID: '0x239',
  isTestNetwork: false,
  currencyName: 'TAC',
  currencyNameLong: 'TAC',
  node: 'https://rpc.ankr.com/tac',
  icon,
  coingeckoID: 'tac',
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const eth = new EvmNetwork(ethOptions);

export default eth;
