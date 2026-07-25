import icon from './icons/shark.webp';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import NFTHandler from '@/libs/nft-handlers/goldrush';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';

const sharkOptions: EvmNetworkOptions = {
  name: 'shark',
  name_long: 'Shark Network',
  homePage: 'https://swapshark.net',
  blockExplorerTX: 'https://sharkscan.app/tx/[[txHash]]',
  blockExplorerAddr: 'https://sharkscan.app/address/[[address]]',
  chainID: '0x15836',
  isTestNetwork: false,
  currencyName: 'SHARK',
  currencyNameLong: 'Shark',
  node: 'https://rpc.rpcshark.com',
  icon,
  NFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const shark = new EvmNetwork(sharkOptions);

export default shark;
