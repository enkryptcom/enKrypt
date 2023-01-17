import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { subscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assets from "./assets/shiden-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import assetHandler from "./libs//assetinfo";
import { toBN } from "web3-utils";

const shidenOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Shiden,
  name_long: "Shiden",
  homePage: "https://shiden.astar.network/",
  blockExplorerTX: "https://shiden.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://shiden.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "SDN",
  currencyNameLong: "Shiden",
  icon: require("../icons/shiden.png"),
  decimals: 18,
  prefix: 5,
  gradient:
    "linear-gradient(326.87deg, #645AFF 12.53%, #E40C5B 50.89%, #FF4C3B 89.24%)",
  node: "wss://shiden.api.onfinality.io/public-ws",
  coingeckoID: "shiden",
  coingeckoPlatform: CoingeckoPlatform.Shiden,
  existentialDeposit: toBN("1000000"),
  genesisHash:
    "0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6",
  activityHandler: wrapActivityHandler(subscanActivity),
  assetHandler,
  knownTokens: assets,
};

const shiden = new SubstrateNetwork(shidenOptions);

export default shiden;
