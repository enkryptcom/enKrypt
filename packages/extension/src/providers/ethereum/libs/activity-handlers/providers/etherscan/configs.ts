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
};

export { NetworkEndpoints };
