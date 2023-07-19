import { NetworkNames } from "@enkryptcom/types";
import { toBN } from "web3-utils";
import { subscanActivity } from "../libs/activity-handlers";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../types/substrate-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const varaOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Vara,
  name_long: "Vara Network",
  homePage: "https://vara-network.io/",
  blockExplorerTX: "https://vara.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://vara.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "VARA",
  currencyNameLong: "Vara",
  icon: require("./icons/vara.svg"),
  decimals: 12,
  prefix: 137,
  gradient: "#0ed3a3",
  node: "wss://rpc.vara-network.io",
  genesisHash:
    "0xfe1b4c55fd4d668101126434206571a7838a8b6b93a6d1b95d607e78e6c53763",
  activityHandler: wrapActivityHandler(subscanActivity),
  existentialDeposit: toBN("10000000000000"),
};

const vara = new SubstrateNetwork(varaOptions);

export default vara;
