import { EthereumNodeType } from "../types";
const maticNode: EthereumNodeType = {
  name: "MATIC",
  name_long: "Polygon (Matic)",
  homePage: "https://polygonscan.com/",
  blockExplorerTX: "https://polygonscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://polygonscan.com/address/[[address]]",
  chainID: 137,
  isTestNetwork: false,
  currencyName: "MATIC",
  node: "wss://nodes.mewapi.io/ws/matic",
};
export default maticNode;
