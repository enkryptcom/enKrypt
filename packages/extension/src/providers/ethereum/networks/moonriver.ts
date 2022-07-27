import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { NetworkNames } from "@enkryptcom/types";
import { EtherscanActivity } from "../libs/activity-handlers";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const moonriverOptions: EvmNetworkOptions = {
  name: NetworkNames.Moonriver,
  name_long: "Moonriver",
  homePage: "https://moonbeam.network/networks/moonriver/",
  blockExplorerTX: "https://moonriver.moonscan.io//tx/[[txHash]]",
  blockExplorerAddr: "https://moonriver.moonscan.io/[[address]]",
  chainID: 1285,
  isTestNetwork: false,
  currencyName: "MOVR",
  node: "wss://wss.api.moonriver.moonbeam.network",
  icon: require("./icons/moonriver.svg"),
  gradient: "linear-gradient(180deg, #F2B705 0%, #53CBC8 100%)",
  coingeckoID: "moonriver",
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const moonriver = new EvmNetwork(moonriverOptions);

export default moonriver;
