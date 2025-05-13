import { NetworkNames } from '@enkryptcom/types';
import { toBN } from 'web3-utils';
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from '@/providers/polkadot/types/substrate-network';
import { subscanActivity } from '@/providers/polkadot/libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetHandler from '@/providers/polkadot/libs/asset-handler';
import assets from './assets-dot';
import { toBase } from '@enkryptcom/utils';
import icon from '../icons/assethub.webp';

const assetHubOptions: SubstrateNetworkOptions = {
  name: NetworkNames.AssetHubDOT,
  name_long: 'Asset Hub | Polkadot',
  homePage: 'https://polkadot.network',
  blockExplorerTX: 'https://assethub-polkadot.subscan.io/extrinsic/[[txHash]]',
  blockExplorerAddr: 'https://assethub-polkadot.subscan.io/account/[[address]]',
  isTestNetwork: false,
  currencyName: 'DOT',
  currencyNameLong: 'Polkadot',
  icon,
  decimals: 10,
  prefix: 0,
  node: 'wss://dot-rpc.stakeworld.io/assethub',
  coingeckoID: 'polkadot',
  genesisHash:
    '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
  activityHandler: wrapActivityHandler(subscanActivity),
  existentialDeposit: toBN(toBase('0.01', 10)),
  assetHandler,
  knownTokens: assets,
};

const assetHub = new SubstrateNetwork(assetHubOptions);

export default assetHub;
