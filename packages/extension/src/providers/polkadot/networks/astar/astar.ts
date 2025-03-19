import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { subscanActivity } from '../../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assets from './assets/astar-assets';
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from '../../types/substrate-network';
import assetHandler from '@/providers/polkadot/libs/asset-handler';
import { toBN } from 'web3-utils';
import icon from '../icons/astar.webp';

const astarOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Astar,
  name_long: 'Astar',
  homePage: 'https://astar.network/',
  blockExplorerTX: 'https://astar.subscan.io/extrinsic/[[txHash]]',
  blockExplorerAddr: 'https://astar.subscan.io/account/[[address]]',
  isTestNetwork: false,
  currencyName: 'ASTR',
  currencyNameLong: 'Astar',
  icon,
  decimals: 18,
  prefix: 5,
  node: 'wss://astar.api.onfinality.io/public-ws',
  coingeckoID: 'astar',
  coingeckoPlatform: CoingeckoPlatform.Astar,
  genesisHash:
    '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6',
  existentialDeposit: toBN('1000000'),
  activityHandler: wrapActivityHandler(subscanActivity),
  assetHandler,
  knownTokens: assets,
};

const astar = new SubstrateNetwork(astarOptions);

export default astar;
