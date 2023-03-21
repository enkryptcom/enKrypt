import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import { NetworkNames } from "@enkryptcom/types";

const qtzOptions: EvmNetworkOptions = {
  name: NetworkNames.QuartzEVM,
  name_long: "Quartz EVM",
  homePage: "https://unique.network/",
  blockExplorerTX: "https://uniquescan.io/quartz/tx/[[txHash]]",
  blockExplorerAddr: "https://uniquescan.io/quartz/account/[[address]]",
  chainID: "0x22b1",
  isTestNetwork: false,
  currencyName: "QTZ",
  currencyNameLong: "Quartz",
  node: "wss://ws-quartz.unique.network",
  icon: require("./icons/quartz.svg"),
  gradient: "#FF4D6A",
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const qtz = new EvmNetwork(qtzOptions);

export default qtz;
