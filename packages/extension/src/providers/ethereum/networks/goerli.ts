import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { RivetActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const goerliOptions: EvmNetworkOptions = {
  name: NetworkNames.Goerli,
  name_long: "Goerli",
  homePage: "https://github.com/goerli/testnet",
  blockExplorerTX: "https://goerli.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://goerli.etherscan.io/address/[[address]]",
  chainID: "0x5",
  isTestNetwork: true,
  currencyName: "GöETH",
  currencyNameLong: "Goerli",
  node: "wss://nodes.mewapi.io/ws/goerli",
  icon: require("./icons/eth.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  activityHandler: wrapActivityHandler(RivetActivity),
};

const goerli = new EvmNetwork(goerliOptions);

export default goerli;
