import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { toBN } from "web3-utils";
import { subscanActivity } from "../libs/activity-handlers";
import { SubstrateNativeToken } from "../types/substrate-native-token";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../types/substrate-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const ksmOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Kusama,
  name_long: "Kusama",
  homePage: "https://kusama.network/",
  blockExplorerTX: "https://kusama.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://kusama.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KSM",
  icon: require("./icons/kusama.svg"),
  decimals: 12,
  prefix: 2,
  gradient: "#000000",
  node: "wss://kusama-rpc.polkadot.io/",
  coingeckoID: "kusama",
  coingeckoPlatform: CoingeckoPlatform.Kusama,
  genesisHash:
    "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
  activityHandler: wrapActivityHandler(subscanActivity),
};

const ksm = new SubstrateNetwork(ksmOptions);

const nativeAsset = new SubstrateNativeToken({
  name: "Kusama",
  symbol: "KSM",
  coingeckoID: "kusama",
  icon: require("./icons/kusama.svg"),
  decimals: 12,
  existentialDeposit: toBN("33333300"),
});

ksm.assets = [nativeAsset];

export default ksm;
