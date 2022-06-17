import { NetworkNames } from "@enkryptcom/types";
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
  node: "wss://rpc.pinknode.io/westend/explorer",
  genesisHash:
    "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
};

const wnd = new SubstrateNetwork(wndOptions);

export default wnd;
