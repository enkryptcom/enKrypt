import { NetworkNames } from "@enkryptcom/types";
import { bip44Paths } from "@src/configs";

const supportedPaths = {
  [NetworkNames.Bitcoin]: [bip44Paths.bitcoinSegwitLedger],
  [NetworkNames.Litecoin]: [bip44Paths.litecoinSegwitLedger],
  [NetworkNames.Dogecoin]: [bip44Paths.dogecoinLedger],
};
export { supportedPaths };
