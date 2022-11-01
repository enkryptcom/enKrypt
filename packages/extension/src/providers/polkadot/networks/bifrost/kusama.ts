import assetHandler from "./libs/assetinfo-orml";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import assets from "./assets/bifrost-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import { subscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { toBN } from "web3-utils";

const bifrostKusamaOptions: SubstrateNetworkOptions = {
  name: NetworkNames.BifrostKusama,
  name_long: "Bifrost (Kusama)",
  homePage: "https://bifrost.finance/",
  blockExplorerTX: "https://bifrost-kusama.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://bifrost-kusama.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "BNC",
  currencyNameLong: "Kusama Bifrost",
  icon: require("../icons/bifrost.svg"),
  decimals: 12,
  prefix: 6,
  gradient:
    "linear-gradient(326.87deg, #5a25f0 12.53%, #5a25f0 50.89%, #5a25f0 89.24%)",
  node: "wss://bifrost-rpc.liebi.com/ws",
  coingeckoID: "bifrost-native-coin",
  coingeckoPlatform: CoingeckoPlatform.Bifrost,
  genesisHash:
    "0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed",
  activityHandler: wrapActivityHandler(subscanActivity),
  assetHandler: assetHandler,
  knownTokens: assets,
  existentialDeposit: toBN("100000000000"),
};

const bifrostKusama = new SubstrateNetwork(bifrostKusamaOptions);

export default bifrostKusama;
