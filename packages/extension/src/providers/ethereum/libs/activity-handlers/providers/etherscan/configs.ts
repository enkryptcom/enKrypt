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
  [NetworkNames.ZkSyncGoerli]:
    "https://block-explorer-api.testnets.zksync.dev/",
  [NetworkNames.ZkSync]: "https://block-explorer-api.mainnet.zksync.io/",
  [NetworkNames.Arbitrum]: "https://api.arbiscan.io/",
  [NetworkNames.Gnosis]: "https://api.gnosisscan.io/",
  [NetworkNames.Avalanche]: "https://api.snowtrace.io/",
  [NetworkNames.Fantom]: "https://api.ftmscan.com/",
  [NetworkNames.Aurora]: "https://explorer.mainnet.aurora.dev/",
  [NetworkNames.PuppyNet]: "https://puppyscan.shib.io/",
  [NetworkNames.Shibarium]: "https://www.shibariumscan.io/",
  [NetworkNames.MaticZK]: "https://api-zkevm.polygonscan.com/",
  [NetworkNames.Base]: "https://api.basescan.org/",
  [NetworkNames.Celo]: "https://explorer.celo.org/mainnet/",
  [NetworkNames.FormTestnet]: "https://testnet-explorer.form.network/",
  [NetworkNames.ArtheraTest]: "https://explorer-test.arthera.net/",
  [NetworkNames.Arthera]: "https://explorer.arthera.net/",
};

export { NetworkEndpoints };
