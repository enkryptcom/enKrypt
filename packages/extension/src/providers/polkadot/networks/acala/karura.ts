import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import assets from "./assets/karura-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import { subscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import ormlAssetHandler from "./libs/assetinfo-orml";

const karuraOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Karura,
  name_long: "Karura",
  homePage: "https://karura.network/",
  blockExplorerTX: "https://karura.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://karura.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KAR",
  currencyNameLong: "Karura",
  icon: require("../icons/karura.svg"),
  decimals: 12,
  prefix: 8,
  node: "wss://karura-rpc-3.aca-api.network/ws",
  gradient: "linear-gradient(330.21deg, #E40C5B -26.31%, #FF4C3B 88.17%)",
  coingeckoID: "karura",
  coingeckoPlatform: CoingeckoPlatform.Karura,
  genesisHash:
    "0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b",
  activityHandler: wrapActivityHandler(subscanActivity),
  assetHandler: ormlAssetHandler,
  knownTokens: assets,
};

const karura = new SubstrateNetwork(karuraOptions);

export default karura;
