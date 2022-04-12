import { SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import { EthereumNodeType } from "../types";
const bscNode: EthereumNodeType = {
  name: "BSC",
  name_long: "Binance Smart Chain",
  homePage: "https://www.binance.org/en/smartChain",
  blockExplorerTX: "https://bscscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://bscscan.com/address/[[address]]",
  chainID: 56,
  isTestNetwork: false,
  currencyName: "BNB",
  node: "wss://nodes.mewapi.io/ws/bsc",
  icon: require("./icons/bsc.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#E6007A",
  displayAddress: (address: string) => toChecksumAddress(address),
};
export default bscNode;
