import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { TelosActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Telos,
  name_long: "Telos EVM",
  homePage: "https://www.telos.net",
  blockExplorerTX: "https://www.teloscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://www.teloscan.io/address/[[address]]",
  chainID: "0x28",
  isTestNetwork: false,
  currencyName: "TLOS",
  currencyNameLong: "Telos",
  node: "wss://telos.drpc.org",
  icon: require("./icons/telos.svg"),
  coingeckoID: "telos",
  coingeckoPlatform: CoingeckoPlatform.Telos,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(TelosActivity),
};

const eth = new EvmNetwork(ethOptions);

export default eth;
