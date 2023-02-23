import { NetworkNames } from "@enkryptcom/types";

const NetworkEndpoints = {
  [NetworkNames.Ethereum]: "https://api.etherscan.io/",
  [NetworkNames.Ropsten]: "https://api-ropsten.etherscan.io/",
  [NetworkNames.Rinkeby]: "https://api-rinkeby.etherscan.io/",
  [NetworkNames.Goerli]: "https://api-goerli.etherscan.io/",
  [NetworkNames.Kovan]: "https://api-kovan.etherscan.io/",
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
  [NetworkNames.ZkSyncGoerli]: "https://zksync2-testnet.zkscan.io/",
  [NetworkNames.ZkSync]: "https://zksync2-mainnet.zkscan.io/",
};

export { NetworkEndpoints };
