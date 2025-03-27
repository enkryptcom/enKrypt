import icon from '../icons/tsys_nevm.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../../types/evm-network';
import { EtherscanActivity } from '../../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const syscoinNEVMTestOptions: EvmNetworkOptions = {
  name: NetworkNames.SyscoinNEVMTest,
  name_long: 'Syscoin NEVM Testnet',
  homePage: 'https://www.syscoin.org/',
  blockExplorerTX: 'https://explorer.tanenbaum.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.tanenbaum.io/address/[[address]]',
  chainID: '0x1644',
  isTestNetwork: true,
  currencyName: 'TSYS',
  currencyNameLong: 'Test Syscoin',
  node: 'wss://rpc.tanenbaum.io/wss',
  icon,
  buyLink: 'https://faucet.syscoin.org',
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const syscoinNEVMTest = new EvmNetwork(syscoinNEVMTestOptions);

export default syscoinNEVMTest;
