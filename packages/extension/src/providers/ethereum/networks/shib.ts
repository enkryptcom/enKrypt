import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const shibOptions: EvmNetworkOptions = {
  name: NetworkNames.Shibarium,
  name_long: "Shibarium",
  homePage: "https://www.shibariumtech.com/",
  blockExplorerTX: "https://www.shibariumscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://www.shibariumscan.io/address/[[address]]",
  chainID: "0x6d",
  isTestNetwork: false,
  currencyName: "BONE",
  currencyNameLong: "BONE",
  node: "https://www.shibrpc.com",
  icon: require("./icons/shiba-inu.svg"),
  coingeckoID: "bone-shibaswap",
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const shib = new EvmNetwork(shibOptions);

export default shib;
