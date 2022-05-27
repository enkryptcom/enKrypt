import { NetworkNames } from "@enkryptcom/types";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../types/substrate-network";

const ksmOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Kusama,
  name_long: "Kusama",
  homePage: "https://kusama.network/",
  blockExplorerTX: "https://polkascan.io/kusama/transaction/[[txHash]]",
  blockExplorerAddr: "https://polkascan.io/kusama/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KSM",
  icon: require("./icons/kusama.svg"),
  decimals: 12,
  prefix: 2,
  gradient: "#82D359",
  node: "wss://kusama-rpc.polkadot.io/",
  coingeckoID: "kusama",
};

const ksm = new SubstrateNetwork(ksmOptions);

export default ksm;
