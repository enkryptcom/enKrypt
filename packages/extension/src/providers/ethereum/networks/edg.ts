import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";

const edgOptions: EvmNetworkOptions = {
  name: NetworkNames.EdgeEVM,
  name_long: "Edgeware EdgeEVM",
  homePage: "https://edgeware.io/",
  blockExplorerTX: "https://edgscan.live/tx/[[txHash]]",
  blockExplorerAddr: "https://edgscan.live/address/[[address]]",
  chainID: "0x7E5",
  isTestNetwork: false,
  currencyName: "EDG",
  currencyNameLong: "Edgeware",
  node: "wss://edgeware.jelliedowl.net",
  icon: require("./icons/edgeware.svg"),
  gradient: "#000000",
  coingeckoID: "edgeware",
  coingeckoPlatform: CoingeckoPlatform.Edgeware,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const edg = new EvmNetwork(edgOptions);

export default edg;
