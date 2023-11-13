import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const artheraOptions: EvmNetworkOptions = {
  name: NetworkNames.Arthera,
  name_long: "Arthera",
  homePage: "https://arthera.net/",
  blockExplorerTX: "https://explorer-test.arthera.net/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer-test.arthera.net/address/[[address]]",
  chainID: "0x2803",
  isTestNetwork: true,
  currencyName: "AA",
  currencyNameLong: "Arthera",
  node: "wss://ws-test.arthera.net",
  icon: require("./icons/aa.svg"),
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const arthera = new EvmNetwork(artheraOptions);

export default arthera;
