import { SignerType } from "@enkryptcom/types";
import { EthereumNodeType } from "../types";
const moonbeamNode: EthereumNodeType = {
  name: "GLMR",
  name_long: "Moonbeam",
  homePage: "https://moonbeam.network",
  blockExplorerTX: "https://moonscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://moonscan.io/address/[[address]]",
  chainID: 1284,
  isTestNetwork: false,
  currencyName: "GLMR",
  node: "https://rpc.api.moonbeam.network",
  icon: require("./icons/moonbeam.png"),
  signer: SignerType.secp256k1,
  gradient: "#8247E5",
};
export default moonbeamNode;
