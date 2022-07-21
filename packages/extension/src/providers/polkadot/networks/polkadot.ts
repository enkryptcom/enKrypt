import { NetworkNames } from "@enkryptcom/types";
import { toBN } from "web3-utils";
import { SubstrateNativeToken } from "../types/substrate-native-token";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../types/substrate-network";
import { subscanActivity } from "../libs/activity-handlers";

const polkadotOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Polkadot,
  name_long: "Polkadot",
  homePage: "https://polkadot.network",
  blockExplorerTX: "https://polkadot.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://polkadot.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "DOT",
  icon: require("./icons/polkadot.svg"),
  decimals: 10,
  prefix: 0,
  gradient: "#8247E5",
  node: "wss://rpc.polkadot.io/",
  coingeckoID: "polkadot",
  genesisHash:
    "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
  activityHandler: subscanActivity,
};

const polkadot = new SubstrateNetwork(polkadotOptions);

const nativeAsset = new SubstrateNativeToken({
  name: "Polkadot",
  symbol: "DOT",
  coingeckoID: "polkadot",
  icon: require("./icons/polkadot.svg"),
  decimals: 10,
  existentialDeposit: toBN("10000000000"),
});

polkadot.assets = [nativeAsset];

export default polkadot;
