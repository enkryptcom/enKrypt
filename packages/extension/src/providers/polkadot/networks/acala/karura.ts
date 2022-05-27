import { NetworkNames } from "@enkryptcom/types";
import assets from "./assets/karura-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";

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
  prefix: 12,
  gradient: "#FF4C3B",
  node: "wss://karura.api.onfinality.io/public-ws",
  coingeckoID: "karura",
};

const karura = new SubstrateNetwork(karuraOptions);

karura.assets = assets;

export default karura;
