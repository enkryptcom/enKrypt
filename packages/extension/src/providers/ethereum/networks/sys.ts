import icon from "./icons/sys_nevm.svg";
import { NetworkNames, CoingeckoPlatform } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const syscoinOptions: EvmNetworkOptions = {
  name: NetworkNames.Syscoin,
  name_long: "Syscoin NEVM",
  homePage: "https://www.syscoin.org/",
  blockExplorerTX: "https://explorer.syscoin.org/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.syscoin.org/address/[[address]]",
  chainID: "0x39",
  isTestNetwork: false,
  currencyName: "SYS",
  currencyNameLong: "Syscoin",
  node: "wss://rpc.syscoin.org/wss",
  icon,
  coingeckoID: "syscoin",
  coingeckoPlatform: CoingeckoPlatform.Syscoin,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const syscoin = new EvmNetwork(syscoinOptions);

export default syscoin;
