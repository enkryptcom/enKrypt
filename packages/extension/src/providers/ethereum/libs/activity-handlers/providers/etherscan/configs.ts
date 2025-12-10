import { NetworkNames } from '@enkryptcom/types';

const NetworkEndpoints: Record<string, string> = {
  [NetworkNames.Ethereum]: 'https://eth.blockscout.com/api?',
  [NetworkNames.Binance]: 'https://api.etherscan.io/v2/api?chainid=56&',
  [NetworkNames.Matic]: 'https://polygon.blockscout.com/api?',
  [NetworkNames.Moonbeam]: 'https://api.etherscan.io/v2/api?chainid=1284&',
  [NetworkNames.Moonriver]: 'https://api.etherscan.io/v2/api?chainid=1285&',
  [NetworkNames.KaruraEVM]: 'https://blockscout.karura.network/api?',
  [NetworkNames.AstarEVM]: 'https://blockscout.com/astar/api?',
  [NetworkNames.ShidenEVM]: 'https://blockscout.com/shiden/api?',
  [NetworkNames.Optimism]: 'https://api.etherscan.io/v2/api?chainid=10&',
  [NetworkNames.EdgeEVM]: 'https://edgscan.live/api?',
  [NetworkNames.Rootstock]: 'https://blockscout.com/rsk/mainnet/api?',
  [NetworkNames.RootstockTestnet]:
    'https://rootstock-testnet.blockscout.com/api?',
  [NetworkNames.SkaleBlockBrawlers]:
    'https://frayed-decent-antares.explorer.mainnet.skalenodes.com/api?',
  [NetworkNames.SkaleCalypso]:
    'https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/api?',
  [NetworkNames.SkaleCryptoBlades]:
    'https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com/api?',
  [NetworkNames.SkaleCryptoColosseum]:
    'https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/api?',
  [NetworkNames.SkaleEuropa]:
    'https://elated-tan-skat.explorer.mainnet.skalenodes.com/api?',
  [NetworkNames.SkaleExorde]:
    'https://light-vast-diphda.explorer.mainnet.skalenodes.com/api?',
  [NetworkNames.SkaleNebula]:
    'https://green-giddy-denebola.explorer.mainnet.skalenodes.com/api?',
  [NetworkNames.SkaleTitan]:
    'https://parallel-stormy-spica.explorer.mainnet.skalenodes.com/api?',
  [NetworkNames.ZkSync]: 'https://block-explorer-api.mainnet.zksync.io/api?',
  [NetworkNames.Arbitrum]: 'https://api.etherscan.io/v2/api?chainid=42161&',
  [NetworkNames.ArbitrumNova]: 'https://api.etherscan.io/v2/api?chainid=42170&',
  [NetworkNames.Gnosis]: 'https://api.etherscan.io/v2/api?chainid=100&',
  [NetworkNames.Avalanche]: 'https://api.snowtrace.io/api?',
  [NetworkNames.Aurora]: 'https://explorer.mainnet.aurora.dev/api?',
  [NetworkNames.PuppyNet]: 'https://puppyscan.shib.io/api?',
  [NetworkNames.Shibarium]: 'https://www.shibariumscan.io/api?',
  [NetworkNames.MaticZK]: 'https://api.etherscan.io/v2/api?chainid=1101&',
  [NetworkNames.Base]: 'https://api.etherscan.io/v2/api?chainid=8453&',
  [NetworkNames.Celo]: 'https://explorer.celo.org/mainnet/api?',
  [NetworkNames.SyscoinNEVMTest]: 'https://explorer.tanenbaum.io/api?',
  [NetworkNames.SyscoinNEVM]: 'https://explorer.syscoin.org/api?',
  [NetworkNames.RolluxTest]: 'https://rollux.tanenbaum.io/api?',
  [NetworkNames.Rollux]: 'https://explorer.rollux.com/api?',
  [NetworkNames.Blast]: 'https://api.etherscan.io/v2/api?chainid=81457&',
  [NetworkNames.Sanko]: 'https://explorer.sanko.xyz/api?',
  [NetworkNames.Sonic]: 'https://api.etherscan.io/v2/api?chainid=146&',
  [NetworkNames.Degen]: 'https://explorer.degen.tips/api?',
  [NetworkNames.Ink]: 'https://explorer.inkonchain.com/api?',
  [NetworkNames.ImmutableZkevm]: 'https://explorer.immutable.com/api?',
  [NetworkNames.Rari]: 'https://mainnet.explorer.rarichain.org/api?',
  [NetworkNames.Forma]: 'https://explorer.forma.art/api?',
  [NetworkNames.XLayer]: 'https://www.oklink.com/api/v5/explorer/xlayer/api?',
  [NetworkNames.Linea]: 'https://api.lineascan.build/api?',
  [NetworkNames.MantaPacific]: 'https://pacific-explorer.manta.network/api?',
  [NetworkNames.Mode]: 'https://explorer.mode.network/api?',
  [NetworkNames.Scroll]: 'https://api.scrollscan.com/api?',
  [NetworkNames.Fraxtal]: 'https://api.etherscan.io/v2/api?chainid=252&',
  [NetworkNames.Coti]: 'https://mainnet.cotiscan.io/api?',
  [NetworkNames.CytonicTestnet]:
    'https://explorer-api.evm.testnet.cytonic.com/api/api?',
  [NetworkNames.Derive]: 'https://explorer.derive.xyz/api?',
  [NetworkNames.Conflux]: 'https://evmapi.confluxscan.org/api?',
  [NetworkNames.Hemi]: 'https://explorer.hemi.xyz/api?',
  [NetworkNames.AppLayerTestnet]:
    'https://testnet-explorer.applayer.com/api/api?',
  [NetworkNames.EthereumClassic]: 'https://etc.blockscout.com/api?',
  [NetworkNames.TAC]: 'https://explorer.tac.build/api?',
};

export { NetworkEndpoints };
