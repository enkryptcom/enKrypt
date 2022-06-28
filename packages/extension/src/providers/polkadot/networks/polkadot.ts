import { NetworkNames } from "@enkryptcom/types";
import BigNumber from "bignumber.js";
import { SubstrateNativeToken } from "../types/substrate-native-token";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../types/substrate-network";

const polkadotOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Polkadot,
  name_long: "Polkadot",
  homePage: "https://polkadot.network",
  blockExplorerTX: "https://polkascan.io/polkadot/transaction/[[txHash]]",
  blockExplorerAddr: "https://polkascan.io/polkadot/account/[[address]]",
  isTestNetwork: false,
  currencyName: "DOT",
  icon: require("./icons/polkadot.svg"),
  decimals: 10,
  prefix: 0,
  gradient: "#8247E5",
  node: "wss://rpc.polkadot.io/",
  coingeckoID: "polkadot",
};

const polkadot = new SubstrateNetwork(polkadotOptions);

const nativeAsset = new SubstrateNativeToken({
  name: "Polkadot",
  symbol: "DOT",
  coingeckoID: "polkadot",
  icon: "",
  decimals: 10,
  existentialDeposit: new BigNumber("10000000000"),
});

polkadot.assets = [nativeAsset];

export default polkadot;
