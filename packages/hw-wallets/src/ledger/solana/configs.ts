import { NetworkNames } from "@enkryptcom/types";
import { bip44Paths } from "../../configs";

const supportedPaths = {
  [NetworkNames.Solana]: [bip44Paths.solanaLedger],
};
export { supportedPaths };
