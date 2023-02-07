import { NetworkNames } from "@enkryptcom/types";
import { bip44Paths } from "../../configs";

const supportedPaths = {
  [NetworkNames.Ethereum]: [
    bip44Paths.ethereumLedger,
    bip44Paths.ethereumLedgerLive,
  ],
  [NetworkNames.Matic]: [
    bip44Paths.ethereumLedger,
    bip44Paths.ethereumLedgerLive,
  ],
  [NetworkNames.Rootstock]: [
    bip44Paths.rootstockLedger,
  ],
  [NetworkNames.EthereumClassic]: [
    bip44Paths.ethereumClassicLedger,
    bip44Paths.ethereumClassicLedgerLive,
  ],
  [NetworkNames.Moonbeam]: [
    bip44Paths.ethereumLedger,
    bip44Paths.ethereumLedgerLive,
  ],
  [NetworkNames.Moonriver]: [
    bip44Paths.ethereumLedger,
    bip44Paths.ethereumLedgerLive,
  ],
  [NetworkNames.Ropsten]: [bip44Paths.ethereumTestnetLedger],
  [NetworkNames.Goerli]: [bip44Paths.ethereumTestnetLedger],
};
export { supportedPaths };
