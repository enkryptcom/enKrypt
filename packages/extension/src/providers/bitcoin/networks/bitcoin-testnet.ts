import { NetworkNames } from "@enkryptcom/types";
import {
  BitcoinNetwork,
  BitcoinNetworkOptions,
} from "../types/bitcoin-network";
import { haskoinHandler } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { GasPriceTypes } from "@/providers/common/types";

const bitcoinOptions: BitcoinNetworkOptions = {
  name: NetworkNames.BitcoinTest,
  name_long: "Bitcoin Testnet",
  homePage: "https://bitcoin.org/en/",
  blockExplorerTX: "https://www.blockchain.com/btc-testnet/tx/[[txHash]]",
  blockExplorerAddr:
    "https://www.blockchain.com/btc-testnet/address/[[address]]",
  isTestNetwork: true,
  currencyName: "tBTC",
  currencyNameLong: "Test Bitcoin",
  icon: require("./icons/tbtc.svg"),
  decimals: 8,
  gradient: "#F7931A",
  node: "https://api.blockchain.info/haskoin-store/btc-testnet/",
  activityHandler: wrapActivityHandler(haskoinHandler),
  basePath: "m/49'/1'/0'/0",
  coingeckoID: "bitcoin",
  feeHandler: () =>
    Promise.resolve({
      [GasPriceTypes.FASTEST]: 25,
      [GasPriceTypes.FAST]: 20,
      [GasPriceTypes.REGULAR]: 10,
      [GasPriceTypes.ECONOMY]: 5,
    }),
  networkInfo: {
    messagePrefix: "\x18Bitcoin Signed Message:\n",
    bech32: "tb",
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
    dustThreshold: null,
  },
};

const bitcoin = new BitcoinNetwork(bitcoinOptions);

export default bitcoin;
