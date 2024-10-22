import icon from "./icons/sys_rollux.svg";
import { NetworkNames, CoingeckoPlatform } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const rolluxOptions: EvmNetworkOptions = {
  name: NetworkNames.Rollux,
  name_long: "Syscoin ROLLUX",
  homePage: "https://www.rollux.com/",
  blockExplorerTX: "https://explorer.rollux.com/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.rollux.com/address/[[address]]",
  chainID: "0x23a",
  isTestNetwork: false,
  currencyName: "SYS",
  currencyNameLong: "Syscoin",
  node: "wss://rpc.rollux.com/wss",
  coingeckoID: "syscoin",
  coingeckoPlatform: CoingeckoPlatform.Rollux,
  icon,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const rollux = new EvmNetwork(rolluxOptions);

export default rollux;
