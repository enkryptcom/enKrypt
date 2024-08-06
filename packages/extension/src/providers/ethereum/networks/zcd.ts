import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { TelosActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const zcdOptions: EvmNetworkOptions = {
  name: NetworkNames.Zchains,
  name_long: "ZChains",
  homePage: "https://www.zchains.com",
  blockExplorerTX: "https://scan.zchains.com/tx/[[txHash]]",
  blockExplorerAddr: "https://scan.zchains.com/address/[[address]]",
  chainID: "168168",
  isTestNetwork: false,
  currencyName: "ZCD",
  currencyNameLong: "ZChains",
  node: "https://rpc.zchains.com",
  icon: require("./icons/zcd.svg"),
  coingeckoID: "zchains",
  coingeckoPlatform: CoingeckoPlatform.zchains,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(TelosActivity),
};

const zcd = new EvmNetwork(zcdOptions);

export default zcd;
