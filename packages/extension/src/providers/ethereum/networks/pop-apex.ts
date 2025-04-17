import icon from './icons/apex.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';

const apexOptions: EvmNetworkOptions = {
  name: NetworkNames.ProofOfPlayApex,
  name_long: 'Proof of Play Apex',
  homePage: 'https://www.proofofplay.com/',
  blockExplorerTX: 'https://explorer.apex.proofofplay.com/tx/[[txHash]]',
  blockExplorerAddr:
    'https://explorer.apex.proofofplay.com/address/[[address]]',
  chainID: '0x1142c',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'https://rpc.apex.proofofplay.com',
  icon,
  coingeckoID: 'ethereum',
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const apex = new EvmNetwork(apexOptions);

export default apex;
