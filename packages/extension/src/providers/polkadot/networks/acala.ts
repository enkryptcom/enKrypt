import { SignerType } from "@enkryptcom/types";
import { PolkadotNodeType } from "../types";
const acaNode: PolkadotNodeType = {
  name: "ACA",
  name_long: "Acala",
  homePage: "https://acala.network/",
  blockExplorerTX: "https://acala.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://acala.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "ACA",
  icon: require("./icons/polkadot.svg"),
  decimals: 10,
  prefix: 10,
  signer: [SignerType.sr25519, SignerType.ed25519],
  gradient: "#53CBC9",
  node: "wss://acala-rpc-0.aca-api.network/",
};
export default acaNode;
