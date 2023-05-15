import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { subscanActivity } from "../../libs/activity-handlers";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const quartzOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Quartz,
  name_long: "Quartz",
  homePage: "https://unique.network/",
  blockExplorerTX: "https://quartz.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://quartz.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "QTZ",
  currencyNameLong: "Quartz",
  icon: require("../icons/quartz.svg"),
  decimals: 18,
  prefix: 255,
  gradient: "#FF4D6A",
  node: "wss://ws-quartz.unique.network",
  coingeckoID: "quartz",
  coingeckoPlatform: CoingeckoPlatform.Quartz,
  genesisHash:
    "0xcd4d732201ebe5d6b014edda071c4203e16867305332301dc8d092044b28e554",
  activityHandler: wrapActivityHandler(subscanActivity),
};

const quartz = new SubstrateNetwork(quartzOptions);

export default quartz;
