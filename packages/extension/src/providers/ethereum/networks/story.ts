import icon from './icons/story.png';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import shNFTHandler from '@/libs/nft-handlers/simplehash';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const storyOptions: EvmNetworkOptions = {
  name: NetworkNames.Story,
  name_long: 'Story',
  homePage: 'https://www.story.foundation/',
  blockExplorerTX: 'https://www.storyscan.xyz/tx/[[txHash]]',
  blockExplorerAddr: 'https://www.storyscan.xyz/address/[[address]]',
  chainID: '0x5EF',
  isTestNetwork: false,
  currencyName: 'IP',
  currencyNameLong: 'IP',
  node: 'https://mainnet.storyrpc.io',
  icon,
  coingeckoID: 'story-2',
  NFTHandler: shNFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const story = new EvmNetwork(storyOptions);

export default story;
