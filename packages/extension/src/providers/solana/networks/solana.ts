import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { SolanaNetwork, SolanaNetworkOptions } from '../types/sol-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import assetsInfoHandler from '@/providers/ethereum/libs/assets-handlers/assetinfo-mew';
import heliusNFTHandler from '@/libs/nft-handlers/helius-solana';
import icon from './icons/sol.webp';

const solanaOptions: SolanaNetworkOptions = {
  name: NetworkNames.Solana,
  name_long: 'Solana',
  homePage: 'https://solana.com/',
  blockExplorerTX: 'https://solscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://solscan.io/account/[[address]]',
  isTestNetwork: false,
  currencyName: 'SOL',
  currencyNameLong: 'Solana',
  icon,
  decimals: 9,
  node: 'https://nodes.mewapi.io/rpc/sol',
  coingeckoID: 'solana',
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
  basePath: "m/44'/501'",
  assetsInfoHandler,
  NFTHandler: heliusNFTHandler,
  coingeckoPlatform: CoingeckoPlatform.Solana,
};

const solana = new SolanaNetwork(solanaOptions);

export default solana;
