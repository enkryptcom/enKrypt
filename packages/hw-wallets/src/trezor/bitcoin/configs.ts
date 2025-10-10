import { NetworkNames } from "@enkryptcom/types";
import { bip44Paths } from "../../configs";

const supportedPaths = {
  [NetworkNames.Bitcoin]: [bip44Paths.bitcoinSegwitTrezor],
  [NetworkNames.BitcoinTest]: [bip44Paths.bitcoinTestSegwitTrezor],
  [NetworkNames.Litecoin]: [bip44Paths.litecoinSegwitTrezor],
  [NetworkNames.Dogecoin]: [bip44Paths.dogecoinTrezor],
};

const TrezorNetworkConfigs = {
  [NetworkNames.Bitcoin]: {
    symbol: "btc",
    isSegwit: true,
  },
  [NetworkNames.BitcoinTest]: {
    symbol: "test",
    isSegwit: true,
  },
  [NetworkNames.Litecoin]: {
    symbol: "ltc",
    isSegwit: true,
  },
  [NetworkNames.Dogecoin]: {
    symbol: "doge",
    isSegwit: false,
  },
};
export { supportedPaths, TrezorNetworkConfigs };
