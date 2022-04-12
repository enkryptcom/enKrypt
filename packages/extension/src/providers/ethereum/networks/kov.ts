import { SignerType } from "@enkryptcom/types";
import { EthereumNodeType } from "../types";
const kovanNode: EthereumNodeType = {
  name: "KOV",
  name_long: "Kovan",
  homePage: "https://github.com/kovan-testnet",
  blockExplorerTX: "https://kovan.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://kovan.etherscan.io/address/[[address]]",
  chainID: 42,
  isTestNetwork: true,
  currencyName: "KOV",
  node: "wss://nodes.mewapi.io/ws/kovan",
  icon: require("./icons/eth.svg"),
  signer: SignerType.secp256k1,
  gradient: "#E6007A",
};
export default kovanNode;
