import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const moonbeamOptions: EvmNetworkOptions = {
  name: NetworkNames.Moonbeam,
  name_long: "Moonbeam",
  homePage: "https://moonbeam.network",
  blockExplorerTX: "https://moonscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://moonscan.io/address/[[address]]",
  chainID: 1284,
  isTestNetwork: false,
  currencyName: "GLMR",
  node: "wss://wss.api.moonbeam.network/",
  icon: require("./icons/moonbeam.svg"),
  gradient: "#8247E5",
  coingeckoID: "moonbeam",
};

const moonbeam = new EvmNetwork(moonbeamOptions);

export default moonbeam;
