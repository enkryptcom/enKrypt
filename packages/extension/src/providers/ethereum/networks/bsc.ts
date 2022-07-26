import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const bscOptions: EvmNetworkOptions = {
  name: NetworkNames.Binance,
  name_long: "BNB Smart Chain",
  homePage: "https://www.binance.org/en/smartChain",
  blockExplorerTX: "https://bscscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://bscscan.com/address/[[address]]",
  chainID: 56,
  isTestNetwork: false,
  currencyName: "BNB",
  node: "wss://nodes.mewapi.io/ws/bsc",
  icon: require("./icons/bsc.svg"),
  gradient: "#F0B90B",
  coingeckoID: "binancecoin",
  basePath: "m/44'/714'",
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const bsc = new EvmNetwork(bscOptions);

export default bsc;
