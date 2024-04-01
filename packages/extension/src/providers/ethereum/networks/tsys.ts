import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const syscoinTestOptions: EvmNetworkOptions = {
  name: NetworkNames.SyscoinTest,
  name_long: "Syscoin NEVM Testnet",
  homePage: "https://www.syscoin.org/",
  blockExplorerTX: "https://tanenbaum.io/tx/[[txHash]]",
  blockExplorerAddr: "https://tanenbaum.io/address/[[address]]",
  chainID: "0x1644",
  isTestNetwork: false,
  currencyName: "TSYS",
  currencyNameLong: "Test Syscoin",
  node: "wss://rpc.tanenbaum.io/wss",
  icon: require("./icons/tsys_nevm.svg"),
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const syscoinTest = new EvmNetwork(syscoinTestOptions);

export default syscoinTest;
