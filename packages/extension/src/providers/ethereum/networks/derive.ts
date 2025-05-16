import icon from './icons/derive.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const deriveOptions: EvmNetworkOptions = {
  name: NetworkNames.Derive,
  name_long: 'Derive',
  homePage: 'https://www.derive.xyz',
  blockExplorerTX: 'https://explorer.derive.xyz/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.derive.xyz/address/[[address]]',
  chainID: '0x3bd',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethers',
  node: 'https://rpc.derive.xyz',
  icon,
  coingeckoID: 'derive',
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const derive = new EvmNetwork(deriveOptions);

export default derive;
