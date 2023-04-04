import { NetworkNames } from "@enkryptcom/types";
import {
  BitcoinNetwork,
  BitcoinNetworkOptions,
} from "../types/bitcoin-network";
import { haskoinHandler } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import BTCFeeHandler from "../libs/btc-fee-handler";

const bitcoinOptions: BitcoinNetworkOptions = {
  name: NetworkNames.Bitcoin,
  name_long: "Bitcoin",
  homePage: "https://bitcoin.org/en/",
  blockExplorerTX: "https://www.blockchain.com/btc/tx/[[txHash]]",
  blockExplorerAddr: "https://www.blockchain.com/btc/address/[[address]]",
  isTestNetwork: false,
  currencyName: "BTC",
  currencyNameLong: "Bitcoin",
  icon: require("./icons/btc.svg"),
  decimals: 8,
  gradient: "#F7931A",
  node: "https://api.blockchain.info/haskoin-store/btc/",
  coingeckoID: "bitcoin",
  activityHandler: wrapActivityHandler(haskoinHandler),
  basePath: "m/49'/0'/0'/0",
  feeHandler: BTCFeeHandler,
  networkInfo: {
    messagePrefix: "\x18Bitcoin Signed Message:\n",
    bech32: "bc",
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
    dustThreshold: null,
  },
};

const bitcoin = new BitcoinNetwork(bitcoinOptions);

export default bitcoin;
