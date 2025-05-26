import icon from './icons/gno.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import NFTHandler from '@/libs/nft-handlers/goldrush';

const gnoOptions: EvmNetworkOptions = {
  name: NetworkNames.Gnosis,
  name_long: 'Gnosis',
  homePage: 'https://www.gnosis.io/',
  blockExplorerTX: 'https://gnosisscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://gnosisscan.io/address/[[address]]',
  chainID: '0x64',
  isTestNetwork: false,
  currencyName: 'DAI',
  currencyNameLong: 'DAI',
  node: 'https://rpc.gnosischain.com',
  icon,
  coingeckoID: 'dai',
  coingeckoPlatform: CoingeckoPlatform.Gnosis,
  assetsInfoHandler,
  NFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const gno = new EvmNetwork(gnoOptions);

export default gno;
