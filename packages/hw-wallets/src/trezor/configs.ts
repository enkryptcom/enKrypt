import { NetworkNames } from "@enkryptcom/types";
import { bip44Paths } from "../configs";

const supportedPaths = {
  [NetworkNames.Ethereum]: [bip44Paths.ethereum],
  [NetworkNames.Matic]: [bip44Paths.ethereum],
  [NetworkNames.EthereumClassic]: [bip44Paths.ethereumClassic],
  [NetworkNames.Ropsten]: [bip44Paths.ethereumTestnet],
  [NetworkNames.Goerli]: [bip44Paths.ethereumTestnet],
};
export { supportedPaths };
