import icon from './icons/zksync.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const zkgoerliOptions: EvmNetworkOptions = {
  name: NetworkNames.zkSyncSepolia,
  name_long: 'zkSync Sepolia',
  homePage: 'https://zksync.io/',
  blockExplorerTX: 'https://sepolia.explorer.zksync.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://sepolia.explorer.zksync.io/address/[[address]]',
  chainID: '0x12c',
  isTestNetwork: true,
  currencyName: 'ETH',
  currencyNameLong: 'ETH ZKSepolia',
  node: 'wss://sepolia.era.zksync.dev/ws',
  icon,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const zkgoerli = new EvmNetwork(zkgoerliOptions);

export default zkgoerli;
