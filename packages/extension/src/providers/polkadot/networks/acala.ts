import { SignerType } from "@enkryptcom/types";
import { PolkadotNodeType } from "../types";
const acaNode: PolkadotNodeType = {
  name: "ACA",
  name_long: "Acala",
  homePage: "https://acala.network/",
  blockExplorerTX: "https://acala.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://acala.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "DOT",
  icon: require("./icons/polkadot.svg"),
  decimals: 10,
  prefix: 10,
  signer: SignerType.sr25519,
  gradient: "#53CBC9",
};
export default acaNode;
