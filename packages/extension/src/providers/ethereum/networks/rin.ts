import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { NetworkNames } from "@enkryptcom/types";
import { RivetActivity } from "../libs/activity-handlers";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const rinOptions: EvmNetworkOptions = {
  name: NetworkNames.Rinkeby,
  name_long: "Rinkeby",
  homePage: "https://www.rinkeby.io/",
  blockExplorerTX: "https://rinkeby.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://rinkeby.etherscan.io/address/[[address]]",
  chainID: 4,
  isTestNetwork: true,
  currencyName: "RIN",
  node: "wss://nodes.mewapi.io/ws/rinkeby",
  icon: require("./icons/eth.svg"),
  gradient: "#C4C4C4",
  activityHandler: wrapActivityHandler(RivetActivity),
};

const rin = new EvmNetwork(rinOptions);

export default rin;
