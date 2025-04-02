import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { subscanActivity } from '../../libs/activity-handlers';
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from '../../types/substrate-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { toBN } from 'web3-utils';
import icon from '../icons/unique.webp';

const uniqueOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Unique,
  name_long: 'Unique',
  homePage: 'https://unique.network/',
  blockExplorerTX: 'https://unique.subscan.io/extrinsic/[[txHash]]',
  blockExplorerAddr: 'https://unique.subscan.io/account/[[address]]',
  isTestNetwork: false,
  currencyName: 'UNQ',
  currencyNameLong: 'Unique',
  icon,
  decimals: 18,
  prefix: 7391,
  node: 'wss://ws.unique.network',
  coingeckoID: 'unique-network',
  coingeckoPlatform: CoingeckoPlatform.Unique,
  genesisHash:
    '0x84322d9cddbf35088f1e54e9a85c967a41a56a4f43445768125e61af166c7d31',
  activityHandler: wrapActivityHandler(subscanActivity),
  existentialDeposit: toBN(0),
};

const unique = new SubstrateNetwork(uniqueOptions);

export default unique;
