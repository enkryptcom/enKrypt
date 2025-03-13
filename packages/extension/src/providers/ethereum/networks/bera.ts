import icon from './icons/bera.png';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import shNFTHandler from '@/libs/nft-handlers/simplehash';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const beraOptions: EvmNetworkOptions = {
  name: NetworkNames.Bera,
  name_long: 'Berachain',
  homePage: 'https://www.berachain.com/',
  blockExplorerTX: 'https://explorer.gravity.xyz/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.gravity.xyz/address/[[address]]',
  chainID: '0x138DE',
  isTestNetwork: false,
  currencyName: 'BERA',
  currencyNameLong: 'BERA',
  coingeckoID: 'berachain-bera',
  node: 'https://berascan.com/',
  icon,
  coingeckoPlatform: CoingeckoPlatform.Berachain,
  NFTHandler: shNFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const bera = new EvmNetwork(beraOptions);

export default bera;
