import { NetworkNames } from "@enkryptcom/types";
import { bip44Paths } from "../../configs";

const DEFAULT_PATHS = [bip44Paths.ethereum];
const supportedPaths = {
  [NetworkNames.Ethereum]: DEFAULT_PATHS,
  [NetworkNames.Matic]: DEFAULT_PATHS,
  [NetworkNames.Avalanche]: DEFAULT_PATHS,
  [NetworkNames.Binance]: DEFAULT_PATHS,
  [NetworkNames.EthereumClassic]: [bip44Paths.ethereumClassic],
  [NetworkNames.Rootstock]: [bip44Paths.rootstock],
  [NetworkNames.MaticZK]: DEFAULT_PATHS,
  [NetworkNames.Moonbeam]: DEFAULT_PATHS,
  [NetworkNames.Moonriver]: DEFAULT_PATHS,
  [NetworkNames.Optimism]: DEFAULT_PATHS,
  [NetworkNames.Sepolia]: [bip44Paths.ethereumTestnetLedger, ...DEFAULT_PATHS],
  [NetworkNames.Okc]: DEFAULT_PATHS,
  [NetworkNames.ShidenEVM]: DEFAULT_PATHS,
  [NetworkNames.AstarEVM]: DEFAULT_PATHS,
  [NetworkNames.ZkSync]: DEFAULT_PATHS,
  [NetworkNames.Arbitrum]: DEFAULT_PATHS,
  [NetworkNames.Gnosis]: DEFAULT_PATHS,
  [NetworkNames.Fantom]: DEFAULT_PATHS,
  [NetworkNames.Kaia]: DEFAULT_PATHS,
  [NetworkNames.Base]: DEFAULT_PATHS,
  [NetworkNames.Celo]: DEFAULT_PATHS,
  [NetworkNames.SyscoinNEVM]: DEFAULT_PATHS,
  [NetworkNames.Telos]: DEFAULT_PATHS,
  [NetworkNames.Blast]: DEFAULT_PATHS,
};
export { supportedPaths };
