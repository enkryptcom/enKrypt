import { NetworkNames } from "@enkryptcom/types";
import { bip44Paths } from "../../configs";

const supportedPaths = {
  [NetworkNames.Bitcoin]: [
    bip44Paths.bitcoinSegwit,
    bip44Paths.bitcoinSegwitLedger,
  ],
};
export { supportedPaths };
