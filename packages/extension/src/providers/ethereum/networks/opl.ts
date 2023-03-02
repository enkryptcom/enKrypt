import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import { NetworkNames } from "@enkryptcom/types";

const oplOptions: EvmNetworkOptions = {
  name: NetworkNames.Opal,
  name_long: "Opal EVM",
  homePage: "https://unique.network/",
  blockExplorerTX: "https://uniquescan.io/opal/tx/[[txHash]]",
  blockExplorerAddr: "https://uniquescan.io/opal/account/[[address]]",
  chainID: "0x22b2",
  isTestNetwork: true,
  currencyName: "OPL",
  currencyNameLong: "Opal",
  node: "wss://ws-opal.unique.network",
  icon: require("./icons/opal.svg"),
  gradient: "#0CB6B8",
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const opl = new EvmNetwork(oplOptions);

export default opl;
