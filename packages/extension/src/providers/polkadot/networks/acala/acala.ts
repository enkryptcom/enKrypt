import { NetworkNames } from "@enkryptcom/types";
import assets from "./assets/acala-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import { subscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const acalaOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Acala,
  name_long: "Acala",
  homePage: "https://acala.network/",
  blockExplorerTX: "https://acala.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://acala.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "ACA",
  icon: require("../icons/acala.svg"),
  decimals: 12,
  prefix: 12,
  gradient: "#53CBC9",
  node: "wss://acala-rpc-0.aca-api.network/",
  coingeckoID: "acala",
  genesisHash:
    "0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c",
  activityHandler: wrapActivityHandler(subscanActivity),
};

const acala = new SubstrateNetwork(acalaOptions);

acala.assets = assets;

export default acala;
