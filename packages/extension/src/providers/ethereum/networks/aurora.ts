import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { EtherscanActivity } from "../libs/activity-handlers";

const auroraOptions: EvmNetworkOptions = {
  name: NetworkNames.Aurora,
  name_long: "Aurora",
  homePage: "https://aurora.dev/",
  blockExplorerTX: "https://explorer.aurora.dev/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.aurora.dev/address/[[address]]",
  chainID: "0x4e454152",
  isTestNetwork: false,
  currencyName: "ETH",
  currencyNameLong: "Ethereum",
  node: "https://mainnet.aurora.dev",
  icon: require("./icons/aurora.png"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "ethereum",
  coingeckoPlatform: CoingeckoPlatform.Aurora,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const aurora = new EvmNetwork(auroraOptions);

export default aurora;
