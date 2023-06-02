import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { RivetActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const goerliOptions: EvmNetworkOptions = {
  name: NetworkNames.Sepolia,
  name_long: "Sepolia",
  homePage: "https://sepolia.dev",
  blockExplorerTX: "https://sepolia.ethvm.com/tx/[[txHash]]",
  blockExplorerAddr: "https://sepolia.ethvm.com/address/[[address]]",
  chainID: "0xaa36a7",
  isTestNetwork: true,
  currencyName: "SEP",
  currencyNameLong: "Sepolia",
  node: "wss://nodes.mewapi.io/ws/sepolia",
  icon: require("./icons/eth.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  activityHandler: wrapActivityHandler(RivetActivity),
};

const goerli = new EvmNetwork(goerliOptions);

export default goerli;
