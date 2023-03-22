import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { NetworkNames } from "@enkryptcom/types";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EtherscanActivity } from "../libs/activity-handlers";


const ontOptions: EvmNetworkOptions = {
  name: NetworkNames.Ontology,
  name_long: "Ontology",
  homePage: "https://ont.io/",
  blockExplorerTX: "https://explorer.ont.io/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.ont.io/address/[[address]]",
  chainID: "0x3a",
  isTestNetwork: false,
  currencyName: "ONT",
  node: "http://dappnode1.ont.io/",
  icon: require("./icons/ont.png"),
  coingeckoID: "ontology",
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const ont = new EvmNetwork(ontOptions);

export default ont;