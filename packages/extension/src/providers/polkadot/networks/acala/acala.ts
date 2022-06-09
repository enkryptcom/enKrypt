import { NetworkNames } from "@enkryptcom/types";
import assets from "./assets/acala-assets";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";

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
};

const acala = new SubstrateNetwork(acalaOptions);

acala.assets = assets;

export default acala;
