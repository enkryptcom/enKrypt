import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const astrOptions: EvmNetworkOptions = {
  name: NetworkNames.AstarEVM,
  name_long: "Astar EVM",
  homePage: "https://astar.network/",
  blockExplorerTX: "https://blockscout.com/astar/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.com/astar/address/[[address]]",
  chainID: 592,
  isTestNetwork: false,
  currencyName: "ASTR",
  node: "wss://astar.public.blastapi.io/",
  icon: require("./icons/astr.png"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "astar",
  coingeckoPlatform: CoingeckoPlatform.Shiden,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const astr = new EvmNetwork(astrOptions);

export default astr;
