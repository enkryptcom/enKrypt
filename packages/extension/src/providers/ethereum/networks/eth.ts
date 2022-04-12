import { SignerType } from "@enkryptcom/types";
import { EthereumNodeType } from "../types";
const ethNode: EthereumNodeType = {
  name: "ETH",
  name_long: "Ethereum",
  homePage: "https://ethereum.org",
  blockExplorerTX: "https://etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://etherscan.io/address/[[address]]",
  chainID: 1,
  isTestNetwork: false,
  currencyName: "ETH",
  node: "wss://nodes.mewapi.io/ws/eth",
  icon: require("./icons/eth.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#8247E5",
};
export default ethNode;
