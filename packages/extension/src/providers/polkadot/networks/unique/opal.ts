import { NetworkNames } from '@enkryptcom/types';
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from '../../types/substrate-network';
import { getActivityHandler } from './libs/activity-handler';
import { toBN } from 'web3-utils';
import icon from '../icons/opal.webp';

const GRAPHQL_ENDPOINT = 'https://api-opal.uniquescan.io/v1/graphql';

const opalOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Opal,
  name_long: 'Opal',
  homePage: 'https://unique.network/',
  blockExplorerTX: 'https://uniquescan.io/opal/extrinsic/[[txHash]]',
  blockExplorerAddr: 'https://uniquescan.io/opal/account/[[address]]',
  isTestNetwork: true,
  currencyName: 'OPL',
  currencyNameLong: 'Opal',
  icon,
  decimals: 18,
  prefix: 42,
  node: 'wss://ws-opal.unique.network',
  genesisHash:
    '0xc87870ef90a438d574b8e320f17db372c50f62beb52e479c8ff6ee5b460670b9',
  existentialDeposit: toBN(0),
  activityHandler: getActivityHandler(GRAPHQL_ENDPOINT),
};

const opal = new SubstrateNetwork(opalOptions);

export default opal;
