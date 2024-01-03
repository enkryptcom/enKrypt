import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EtherscanActivity } from "../libs/activity-handlers";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const moonriverOptions: EvmNetworkOptions = {
  name: NetworkNames.Moonriver,
  name_long: "Moonriver",
  homePage: "https://moonbeam.network/networks/moonriver/",
  blockExplorerTX: "https://moonriver.moonscan.io//tx/[[txHash]]",
  blockExplorerAddr: "https://moonriver.moonscan.io/address/[[address]]",
  chainID: "0x505",
  isTestNetwork: false,
  currencyName: "MOVR",
  currencyNameLong: "Moonriver",
  node: "wss://wss.api.moonriver.moonbeam.network",
  icon: require("./icons/moonriver.svg"),
  coingeckoID: "moonriver",
  coingeckoPlatform: CoingeckoPlatform.Moonriver,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const moonriver = new EvmNetwork(moonriverOptions);

export default moonriver;
