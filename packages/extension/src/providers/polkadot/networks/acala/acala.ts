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
  node: "wss://acala-polkadot.api.onfinality.io/ws?apikey=c3bdf4c6-45f5-4558-a848-44cc0c372405",
  coingeckoID: "acala",
  genesisHash:
    "0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c",
};

const acala = new SubstrateNetwork(acalaOptions);

acala.assets = assets;

export default acala;
