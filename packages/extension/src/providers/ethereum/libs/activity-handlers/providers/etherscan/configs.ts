import { NetworkNames } from '@enkryptcom/types';

const NetworkEndpoints: Record<string, string> = {
  [NetworkNames.Ethereum]: 'https://eth.blockscout.com/',
  [NetworkNames.Binance]: 'https://api.bscscan.com/',
  [NetworkNames.Matic]: 'https://polygon.blockscout.com/',
  [NetworkNames.Moonbeam]: 'https://api-moonbeam.moonscan.io/',
  [NetworkNames.Moonriver]: 'https://api-moonriver.moonscan.io/',
  [NetworkNames.KaruraEVM]: 'https://blockscout.karura.network/',
  [NetworkNames.AstarEVM]: 'https://blockscout.com/astar/',
  [NetworkNames.ShidenEVM]: 'https://blockscout.com/shiden/',
  [NetworkNames.Optimism]: 'https://api-optimistic.etherscan.io/',
  [NetworkNames.Canto]: 'https://evm.explorer.canto.io/',
  [NetworkNames.EdgeEVM]: 'https://edgscan.live/',
  [NetworkNames.Rootstock]: 'https://blockscout.com/rsk/mainnet/',
  [NetworkNames.RootstockTestnet]: 'https://rootstock-testnet.blockscout.com/',
  [NetworkNames.SkaleBlockBrawlers]:
    'https://frayed-decent-antares.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleCalypso]:
    'https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleCryptoBlades]:
    'https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleCryptoColosseum]:
    'https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleEuropa]:
    'https://elated-tan-skat.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleExorde]:
    'https://light-vast-diphda.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleNebula]:
    'https://green-giddy-denebola.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleRazor]:
    'https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleTitan]:
    'https://parallel-stormy-spica.explorer.mainnet.skalenodes.com/',
  [NetworkNames.SkaleChaos]:
    'https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com/',
  [NetworkNames.ZkSyncGoerli]:
    'https://block-explorer-api.testnets.zksync.dev/',
  [NetworkNames.ZkSync]: 'https://block-explorer-api.mainnet.zksync.io/',
  [NetworkNames.Arbitrum]: 'https://api.arbiscan.io/',
  [NetworkNames.ArbitrumNova]: 'https://nova-explorer.arbitrum.io/',
  [NetworkNames.Gnosis]: 'https://api.gnosisscan.io/',
  [NetworkNames.Avalanche]: 'https://api.snowtrace.io/',
  [NetworkNames.Fantom]: 'https://api.ftmscan.com/',
  [NetworkNames.Aurora]: 'https://explorer.mainnet.aurora.dev/',
  [NetworkNames.PuppyNet]: 'https://puppyscan.shib.io/',
  [NetworkNames.Shibarium]: 'https://www.shibariumscan.io/',
  [NetworkNames.MaticZK]: 'https://api-zkevm.polygonscan.com/',
  [NetworkNames.Base]: 'https://api.basescan.org/',
  [NetworkNames.Celo]: 'https://explorer.celo.org/mainnet/',
  [NetworkNames.FormTestnet]: 'https://testnet-explorer.form.network/',
  [NetworkNames.Form]: 'https://explorer.form.network/',
  [NetworkNames.ArtheraTest]: 'https://explorer-test.arthera.net/',
  [NetworkNames.Arthera]: 'https://explorer.arthera.net/',
  [NetworkNames.SyscoinNEVMTest]: 'https://explorer.tanenbaum.io/',
  [NetworkNames.SyscoinNEVM]: 'https://explorer.syscoin.org/',
  [NetworkNames.RolluxTest]: 'https://rollux.tanenbaum.io/',
  [NetworkNames.Rollux]: 'https://explorer.rollux.com/',
  [NetworkNames.Blast]: 'https://api.blastscan.io/',
  [NetworkNames.Sanko]: 'https://explorer.sanko.xyz/',
  [NetworkNames.Degen]: 'https://explorer.degen.tips/',
  [NetworkNames.Ham]: 'https://explorer.ham.fun/',
  [NetworkNames.ImmutableZkevm]: 'https://explorer.immutable.com/',
  [NetworkNames.Rari]: 'https://mainnet.explorer.rarichain.org/',
  [NetworkNames.Forma]: 'https://explorer.forma.art/',
  [NetworkNames.XLayer]: 'https://www.oklink.com/api/v5/explorer/xlayer/',
  [NetworkNames.Linea]: 'https://api.lineascan.build/',
  [NetworkNames.MantaPacific]: 'https://pacific-explorer.manta.network/',
  [NetworkNames.Mode]: 'https://explorer.mode.network/',
  [NetworkNames.ProofOfPlayApex]: 'https://explorer.apex.proofofplay.com/',
  [NetworkNames.Scroll]: 'https://api.scrollscan.com/',
  [NetworkNames.Fraxtal]: 'https://api.fraxscan.com/',
  [NetworkNames.Coti]: 'https://mainnet.cotiscan.io/',
  [NetworkNames.CytonicTestnet]:
    'https://explorer-api.evm.testnet.cytonic.com/api/',
  [NetworkNames.Derive]: 'https://explorer.derive.xyz/',
  [NetworkNames.Conflux]: 'https://evmapi.confluxscan.org/',
  [NetworkNames.Hemi]: 'https://explorer.hemi.xyz/',
};

export { NetworkEndpoints };
