import { SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import { EthereumNodeType } from "../types";
const ropstenNode: EthereumNodeType = {
  name: "ROP",
  name_long: "Ropsten",
  homePage: "https://github.com/ethereum/ropsten",
  blockExplorerTX: "https://ropsten.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://ropsten.etherscan.io/address/[[address]]",
  chainID: 3,
  isTestNetwork: true,
  currencyName: "ROP",
  node: "wss://nodes.mewapi.io/ws/rop",
  icon: require("./icons/eth.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#E6007A",
  displayAddress: (address: string) => toChecksumAddress(address),
};
export default ropstenNode;
