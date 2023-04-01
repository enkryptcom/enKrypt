import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { NetworkNames } from "@enkryptcom/types";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { OntEVMActivity } from "../libs/activity-handlers";

const ontEVMOptions: EvmNetworkOptions = {
  name: NetworkNames.OntologyEVM,
  name_long: "Ontology EVM",
  homePage: "https://ont.io/",
  blockExplorerTX: "https://explorer.ont.io/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.ont.io/address/[[address]]",
  chainID: "0x3a",
  isTestNetwork: false,
  currencyName: "ONG",
  currencyNameLong: "Ontology",
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  node: "https://dappnode1.ont.io:10339",
  icon: require("./icons/ont-evm.png"),
  coingeckoID: "ontology",
  activityHandler: wrapActivityHandler(OntEVMActivity),
};

const ontevm = new EvmNetwork(ontEVMOptions);

export default ontevm;
