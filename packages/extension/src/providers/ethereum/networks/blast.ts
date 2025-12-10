import icon from './icons/blast.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Blast,
  name_long: 'Blast',
  homePage: 'https://blast.io/en',
  blockExplorerTX: 'https://blastscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://blastscan.io/address/[[address]]',
  chainID: '0x13e31',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'wss://blast-rpc.publicnode.com',
  icon,
  coingeckoID: 'ethereum',
  coingeckoPlatform: CoingeckoPlatform.Blast,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const eth = new EvmNetwork(ethOptions);

export default eth;
