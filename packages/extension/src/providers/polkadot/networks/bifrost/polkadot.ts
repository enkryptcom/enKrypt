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

const bifrostPolkadotOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Bifrost,
  name_long: "Bifrost",
  homePage: "https://bifrost.finance/",
  blockExplorerTX: "https://bifrost.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://bifrost.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "BNC",
  currencyNameLong: "Bifrost",
  icon: require("../icons/bifrost.svg"),
  decimals: 12,
  prefix: 6,
  gradient:
    "linear-gradient(326.87deg, #5a25f0 12.53%, #5a25f0 50.89%, #5a25f0 89.24%)",
  node: "wss://hk.p.bifrost-rpc.liebi.com/ws",
  coingeckoID: "bifrost-native-coin",
  coingeckoPlatform: CoingeckoPlatform.Bifrost,
  genesisHash:
    "0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b",
  activityHandler: wrapActivityHandler(subscanActivity),
  assetHandler: assetHandler,
  knownTokens: assets,
  existentialDeposit: toBN("100000000000"),
};

const bifrostPolkadot = new SubstrateNetwork(bifrostPolkadotOptions);

export default bifrostPolkadot;
