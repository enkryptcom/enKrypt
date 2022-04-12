import { SignerType } from "@enkryptcom/types";
import { EthereumNodeType } from "../types";
const etcNode: EthereumNodeType = {
  name: "ETC",
  name_long: "Ethereum Classic",
  homePage: "https://ethereumclassic.org/",
  blockExplorerTX: "https://blockscout.com/etc/mainnet/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.com/etc/mainnet/address/[[address]]",
  chainID: 61,
  isTestNetwork: false,
  currencyName: "ETC",
  node: "wss://www.ethercluster.com/ws-etc",
  icon: require("./icons/etc.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#53CBC9",
};
export default etcNode;
