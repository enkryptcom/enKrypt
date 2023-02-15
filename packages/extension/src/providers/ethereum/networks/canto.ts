import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EtherscanActivity } from "../libs/activity-handlers";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const cantoOptions: EvmNetworkOptions = {
  name: NetworkNames.Canto,
  name_long: "Canto",
  homePage: "https://canto.io/",
  blockExplorerTX: "https://evm.explorer.canto.io/tx/[[txHash]]",
  blockExplorerAddr: "https://evm.explorer.canto.io/address/[[address]]",
  chainID: "0x1e14",
  isTestNetwork: false,
  currencyName: "CANTO",
  currencyNameLong: "Canto",
  node: "https://canto.gravitychain.io/",
  icon: require("./icons/canto.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "canto",
  coingeckoPlatform: CoingeckoPlatform.Canto,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const canto = new EvmNetwork(cantoOptions);

export default canto;
