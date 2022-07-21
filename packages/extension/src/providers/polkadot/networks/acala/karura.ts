import { NetworkNames } from "@enkryptcom/types";
import assets from "./assets/karura-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import { subscanActivity } from "../../libs/activity-handlers";

const karuraOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Karura,
  name_long: "Karura",
  homePage: "https://karura.network/",
  blockExplorerTX: "https://karura.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://karura.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KAR",
  icon: require("../icons/karura.svg"),
  decimals: 12,
  prefix: 8,
  gradient: "#FF4C3B",
  node: "wss://karura.api.onfinality.io/ws?apikey=415db624-5391-4e4a-8353-b84fadc0e73f",
  coingeckoID: "karura",
  genesisHash:
    "0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b",
  activityHandler: subscanActivity,
};

const karura = new SubstrateNetwork(karuraOptions);

karura.assets = assets;

export default karura;
