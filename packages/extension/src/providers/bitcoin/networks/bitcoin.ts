import { NetworkNames } from "@enkryptcom/types";
import {
  BitcoinNetwork,
  BitcoinNetworkOptions,
} from "../types/bitcoin-network";
import { nodeActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const bitcoinOptions: BitcoinNetworkOptions = {
  name: NetworkNames.Polkadot,
  name_long: "Polkadot",
  homePage: "https://bitcoin.org/en/",
  blockExplorerTX: "https://www.blockchain.com/btc/tx/[[txHash]]",
  blockExplorerAddr: "https://www.blockchain.com/btc/address/[[address]]",
  isTestNetwork: false,
  currencyName: "BTC",
  icon: require("./icons/btc.svg"),
  decimals: 10,
  gradient: "#F7931A",
  node: "",
  coingeckoID: "bitcoin",
  activityHandler: wrapActivityHandler(nodeActivity),
  basePath: "m/49'/0'/0'/0",
};

const bitcoin = new BitcoinNetwork(bitcoinOptions);

export default bitcoin;
