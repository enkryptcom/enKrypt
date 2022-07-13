import { NetworkNames } from "@enkryptcom/types";
import { bip44Paths } from "../../configs";

const supportedPaths = {
  [NetworkNames.Ethereum]: [
    bip44Paths.ledgerEthereum,
    bip44Paths.ledgerLiveEthereum,
  ],
  [NetworkNames.Matic]: [
    bip44Paths.ledgerEthereum,
    bip44Paths.ledgerLiveEthereum,
  ],
  [NetworkNames.EthereumClassic]: [
    bip44Paths.ethereumClassic,
    bip44Paths.ethereumClassicLedgerLive,
  ],
  [NetworkNames.Ropsten]: [bip44Paths.ethereumTestnets],
  [NetworkNames.Goerli]: [bip44Paths.ethereumTestnets],
};
export { supportedPaths };
