import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EtherscanActivity } from "../libs/activity-handlers";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const moonbeamOptions: EvmNetworkOptions = {
  name: NetworkNames.Moonbeam,
  name_long: "Moonbeam",
  homePage: "https://moonbeam.network",
  blockExplorerTX: "https://moonscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://moonscan.io/address/[[address]]",
  chainID: "0x504",
  isTestNetwork: false,
  currencyName: "GLMR",
  currencyNameLong: "Moonbeam",
  node: "wss://wss.api.moonbeam.network/",
  icon: require("./icons/moonbeam.svg"),
  gradient: "#53CBC9",
  coingeckoID: "moonbeam",
  coingeckoPlatform: CoingeckoPlatform.Moonbeam,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const moonbeam = new EvmNetwork(moonbeamOptions);

export default moonbeam;
