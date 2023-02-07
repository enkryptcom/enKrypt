import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { toBN } from "web3-utils";
import { subscanActivity } from "../libs/activity-handlers";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../types/substrate-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const edgewareOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Edgeware,
  name_long: "Edgeware",
  homePage: "https://www.edgeware.io/",
  blockExplorerTX: "https://edgeware.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://edgeware.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "EDG",
  currencyNameLong: "Edgeware",
  icon: require("./icons/edgeware.svg"),
  decimals: 18,
  prefix: 7,
  gradient: "#000000",
  node: "wss://edgeware.jelliedowl.net",
  coingeckoID: "edgeware",
  coingeckoPlatform: CoingeckoPlatform.Edgeware,
  genesisHash:
    "0x742a2ca70c2fda6cee4f8df98d64c4c670a052d9568058982dad9d5a7a135c5b",
  activityHandler: wrapActivityHandler(subscanActivity),
  existentialDeposit: toBN("10000000000000"),
};

const edgeware = new SubstrateNetwork(edgewareOptions);

export default edgeware;
