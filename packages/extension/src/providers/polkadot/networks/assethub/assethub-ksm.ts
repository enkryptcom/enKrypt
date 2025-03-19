import { NetworkNames } from '@enkryptcom/types';
import { toBN } from 'web3-utils';
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from '@/providers/polkadot/types/substrate-network';
import { subscanActivity } from '@/providers/polkadot/libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetHandler from '@/providers/polkadot/libs/asset-handler';
import assets from './assets-ksm';
import { toBase } from '@enkryptcom/utils';
import icon from '../icons/assethub.webp';

const assetHubOptions: SubstrateNetworkOptions = {
  name: NetworkNames.AssetHubKSM,
  name_long: 'Asset Hub | Kusama',
  homePage: 'https://kusama.network/',
  blockExplorerTX: 'https://assethub-kusama.subscan.io/extrinsic/[[txHash]]',
  blockExplorerAddr: 'https://assethub-kusama.subscan.io/account/[[address]]',
  isTestNetwork: false,
  currencyName: 'KSM',
  currencyNameLong: 'Kusama',
  icon,
  decimals: 12,
  prefix: 2,
  node: 'wss://kusama-asset-hub-rpc.polkadot.io/',
  coingeckoID: 'kusama',
  genesisHash:
    '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a',
  activityHandler: wrapActivityHandler(subscanActivity),
  existentialDeposit: toBN(toBase('0.000003333333', 12)),
  assetHandler,
  knownTokens: assets,
};

const assetHub = new SubstrateNetwork(assetHubOptions);

export default assetHub;
