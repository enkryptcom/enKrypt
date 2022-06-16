import { NetworkNames } from "@enkryptcom/types";
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
  genesisHash:
    "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
};

const polkadot = new SubstrateNetwork(polkadotOptions);

const nativeAsset = new SubstrateNativeToken({
  name: "Polkadot",
  symbol: "DOT",
  coingeckoID: "polkadot",
  icon: "",
  decimals: 10,
});

polkadot.assets = [nativeAsset];

export default polkadot;
