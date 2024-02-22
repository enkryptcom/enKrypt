import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { TomoScan } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const tomoOptions: EvmNetworkOptions = {
  name: NetworkNames.TomoChain,
  name_long: "Viction",
  homePage: "https://viction.xyz/",
  blockExplorerTX: "https://tomoscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://tomoscan.io/address/[[address]]",
  chainID: "0x58",
  isTestNetwork: false,
  currencyName: "VIC",
  currencyNameLong: "Viction",
  node: "wss://ws.tomochain.com",
  icon: require("./icons/viction.png"),
  coingeckoID: "tomochain",
  basePath: "m/44'/889'/0'/0",
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(TomoScan),
};

const tomo = new EvmNetwork(tomoOptions);

export default tomo;
