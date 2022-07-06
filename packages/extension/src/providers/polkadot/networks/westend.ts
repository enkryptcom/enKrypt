import { NetworkNames } from "@enkryptcom/types";
import { toBN } from "web3-utils";
import { SubstrateNativeToken } from "../types/substrate-native-token";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../types/substrate-network";

const wndOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Westend,
  name_long: "Westend",
  homePage: "https://polkadot.network",
  blockExplorerTX: "https://westend.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://westend.subscan.io/extrinsic/[[address]]",
  isTestNetwork: true,
  currencyName: "WND",
  icon: require("./icons/westend.svg"),
  decimals: 12,
  prefix: 42,
  gradient: "#8247E5",
  node: "wss://westend-rpc.dwellir.com",
  genesisHash:
    "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
};

const wnd = new SubstrateNetwork(wndOptions);

const nativeAsset = new SubstrateNativeToken({
  name: "Westend",
  symbol: "WND",
  icon: require("./icons/westend.svg"),
  decimals: 12,
  existentialDeposit: toBN("10000000000"),
});

wnd.assets = [nativeAsset];

export default wnd;
