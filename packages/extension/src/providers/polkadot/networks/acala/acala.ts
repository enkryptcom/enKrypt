import ormlAssetHandler from './libs/assetinfo-orml';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import assets from './assets/acala-assets';
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from '../../types/substrate-network';
import { subscanActivity } from '../../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { toBN } from 'web3-utils';
import icon from '../icons/acala.webp';

const acalaOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Acala,
  name_long: 'Acala',
  homePage: 'https://acala.network/',
  blockExplorerTX: 'https://acala.subscan.io/extrinsic/[[txHash]]',
  blockExplorerAddr: 'https://acala.subscan.io/account/[[address]]',
  isTestNetwork: false,
  currencyName: 'ACA',
  currencyNameLong: 'Acala',
  icon,
  decimals: 12,
  prefix: 12,
  node: 'wss://acala-rpc-1.aca-api.network/',
  coingeckoID: 'acala',
  coingeckoPlatform: CoingeckoPlatform.Acala,
  genesisHash:
    '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c',
  activityHandler: wrapActivityHandler(subscanActivity),
  assetHandler: ormlAssetHandler,
  knownTokens: assets,
  existentialDeposit: toBN('100000000000'),
};

const acala = new SubstrateNetwork(acalaOptions);

export default acala;
