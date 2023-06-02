import { NetworkNames } from "@enkryptcom/types";

const NetworkEndpoints: Record<string, string> = {
  [NetworkNames.Ethereum]: "https://api.etherscan.io/",
  [NetworkNames.Goerli]: "https://api-goerli.etherscan.io/",
  [NetworkNames.Binance]: "https://api.bscscan.com/",
  [NetworkNames.Matic]: "https://api.polygonscan.com/",
  [NetworkNames.Moonbeam]: "https://api-moonbeam.moonscan.io/",
  [NetworkNames.Moonriver]: "https://api-moonriver.moonscan.io/",
  [NetworkNames.KaruraEVM]: "https://blockscout.karura.network/",
  [NetworkNames.AstarEVM]: "https://blockscout.com/astar/",
  [NetworkNames.ShidenEVM]: "https://blockscout.com/shiden/",
  [NetworkNames.Optimism]: "https://api-optimistic.etherscan.io/",
  [NetworkNames.Canto]: "https://evm.explorer.canto.io/",
  [NetworkNames.EdgeEVM]: "https://edgscan.live/",
  [NetworkNames.Rootstock]: "https://blockscout.com/rsk/mainnet/",
  [NetworkNames.SkaleBlockBrawlers]:
    "https://frayed-decent-antares.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleCalypso]:
    "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleCryptoBlades]:
    "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleCryptoColosseum]:
    "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleEuropa]:
    "https://elated-tan-skat.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleExorde]:
    "https://light-vast-diphda.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleNebula]:
    "https://green-giddy-denebola.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleRazor]:
    "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleTitan]:
    "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com/",
  [NetworkNames.SkaleChaos]:
    "https://staging-fast-active-bellatrix.explorer.staging-v3.skalenodes.com/",
  [NetworkNames.ZkSyncGoerli]: "https://zksync2-testnet.zkscan.io/",
  [NetworkNames.ZkSync]: "https://zksync2-mainnet.zkscan.io/",
  [NetworkNames.Arbitrum]: "https://api.arbiscan.io/",
  [NetworkNames.Gnosis]: "https://api.gnosisscan.io/",
  [NetworkNames.Avalanche]: "https://api.snowtrace.io/",
  [NetworkNames.Fantom]: "https://api.ftmscan.com/",
  [NetworkNames.Aurora]: "https://explorer.mainnet.aurora.dev/",
  [NetworkNames.PuppyNet]: "https://puppyscan.shib.io/",
};

export { NetworkEndpoints };
