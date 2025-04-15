import icon from './icons/aa.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const artheraTestOptions: EvmNetworkOptions = {
  name: NetworkNames.ArtheraTest,
  name_long: 'Arthera Test',
  homePage: 'https://arthera.net/',
  blockExplorerTX: 'https://explorer-test.arthera.net/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer-test.arthera.net/address/[[address]]',
  chainID: '0x2803',
  isTestNetwork: true,
  currencyName: 'AA',
  currencyNameLong: 'Arthera',
  node: 'https://rpc-test.arthera.net',
  icon,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const artheraTest = new EvmNetwork(artheraTestOptions);

export default artheraTest;
