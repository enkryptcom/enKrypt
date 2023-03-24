import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { NetworkNames } from "@enkryptcom/types";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { OntEVMActivity } from "../libs/activity-handlers";

const ontEVMOptions: EvmNetworkOptions = {
  name: NetworkNames.OntologyEVM,
  name_long: "OntologyEVM",
  homePage: "https://ont.io/",
  blockExplorerTX: "https://explorer.ont.io/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.ont.io/address/[[address]]",
  chainID: "0x3a",
  isTestNetwork: false,
  currencyName: "WONT",
  node: "http://dappnode1.ont.io/",
  icon: require("./icons/wont.png"),
  coingeckoID: "ontology",
  activityHandler: wrapActivityHandler(OntEVMActivity),
};

const ontevm = new EvmNetwork(ontEVMOptions);

export default ontevm;
