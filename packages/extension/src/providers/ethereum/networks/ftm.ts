import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const ftmOptions: EvmNetworkOptions = {
  name: NetworkNames.Fantom,
  name_long: "Fantom",
  homePage: "https://fantom.foundation/",
  blockExplorerTX: "https://ftmscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://ftmscan.com/address/[[address]]",
  chainID: "0xfa",
  isTestNetwork: false,
  currencyName: "FTM",
  currencyNameLong: "Fantom",
  node: "https://rpc.ankr.com/fantom/",
  icon: require("./icons/ftm.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "fantom",
  coingeckoPlatform: CoingeckoPlatform.Fantom,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const ftm = new EvmNetwork(ftmOptions);

export default ftm;
