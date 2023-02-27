import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import { NetworkNames } from "@enkryptcom/types";

const unqOptions: EvmNetworkOptions = {
  name: NetworkNames.Unique,
  name_long: "Unique EVM",
  homePage: "https://unique.network/",
  blockExplorerTX: "https://uniquescan.io/unique/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://uniquescan.io/unique/account/[[address]]",
  chainID: "0x22b0",
  isTestNetwork: false,
  currencyName: "UNQ",
  currencyNameLong: "Unique",
  node: "wss://ws.unique.network",
  icon: require("./icons/unique.svg"),
  gradient: "#00BFFF",
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const unq = new EvmNetwork(unqOptions);

export default unq;
