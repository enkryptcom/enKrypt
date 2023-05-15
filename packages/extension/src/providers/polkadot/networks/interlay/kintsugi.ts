import assetHandler from "./libs/assetinfo-orml";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import assets from "./assets/kintsugi-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import { subscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { toBN } from "web3-utils";

const kintsugiOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Kintsugi,
  name_long: "Kintsugi",
  homePage: "https://interlay.io/kintsugi",
  blockExplorerTX: "https://kintsugi.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://kintsugi.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KINT",
  currencyNameLong: "Kintsugi",
  icon: require("../icons/kintsugi.svg"),
  decimals: 12,
  prefix: 2092,
  gradient:
    "linear-gradient(326.87deg, #041333 12.53%, #041333 50.89%, #041333 89.24%)",
  node: "wss://api-kusama.interlay.io:443/parachain",
  coingeckoID: "kintsugi",
  coingeckoPlatform: CoingeckoPlatform.Kintsugi,
  genesisHash:
    "0x9af9a64e6e4da8e3073901c3ff0cc4c3aad9563786d89daf6ad820b6e14a0b8b",
  activityHandler: wrapActivityHandler(subscanActivity),
  assetHandler: assetHandler,
  knownTokens: assets,
  existentialDeposit: toBN("0"),
};

const kintsugi = new SubstrateNetwork(kintsugiOptions);

export default kintsugi;
