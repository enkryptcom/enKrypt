import icon from './icons/shiba-inu.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const pupOptions: EvmNetworkOptions = {
  name: NetworkNames.PuppyNet,
  name_long: 'Puppy Net',
  homePage: 'https://www.shibariumtech.com/',
  blockExplorerTX: 'https://puppyscan.shib.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://puppyscan.shib.io/address/[[address]]',
  chainID: '0x2cf',
  isTestNetwork: true,
  currencyName: 'BONE',
  currencyNameLong: 'BONE',
  node: 'https://puppynet.shibrpc.com',
  icon,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const puppy = new EvmNetwork(pupOptions);

export default puppy;
