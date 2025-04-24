import icon from './icons/bera.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import NFTHandler from '@/libs/nft-handlers/goldrush';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const beraOptions: EvmNetworkOptions = {
  name: NetworkNames.Bera,
  name_long: 'Berachain',
  homePage: 'https://www.berachain.com/',
  blockExplorerTX: 'https://berascan.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://berascan.com/address/[[address]]',
  chainID: '0x138DE',
  isTestNetwork: false,
  currencyName: 'BERA',
  currencyNameLong: 'BERA',
  coingeckoID: 'berachain-bera',
  node: 'https://rpc.berachain.com/',
  icon,
  coingeckoPlatform: CoingeckoPlatform.Berachain,
  NFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const bera = new EvmNetwork(beraOptions);

export default bera;
