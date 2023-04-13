import assetHandler from "./libs/assetinfo-orml";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import assets from "./assets/interlay-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import { subscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { toBN } from "web3-utils";

const interlayOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Interlay,
  name_long: "Interlay",
  homePage: "https://interlay.io/",
  blockExplorerTX: "https://interlay.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://interlay.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "INTR",
  currencyNameLong: "Interlay",
  icon: require("../icons/interlay.svg"),
  decimals: 12,
  prefix: 2032,
  gradient:
    "linear-gradient(326.87deg, #1A0A2D 12.53%, #1A0A2D 50.89%, #1A0A2D 89.24%)",
  node: "wss://api.interlay.io:443/parachain",
  coingeckoID: "interlay",
  coingeckoPlatform: CoingeckoPlatform.Interlay,
  genesisHash:
    "0xbf88efe70e9e0e916416e8bed61f2b45717f517d7f3523e33c7b001e5ffcbc72",
  activityHandler: wrapActivityHandler(subscanActivity),
  assetHandler: assetHandler,
  knownTokens: assets,
  existentialDeposit: toBN("0"),
};

const interlay = new SubstrateNetwork(interlayOptions);

export default interlay;
