import { EthereumNodeType } from "../types";
const rinkebyNode: EthereumNodeType = {
  name: "RIN",
  name_long: "Rinkeby",
  homePage: "https://www.rinkeby.io/",
  blockExplorerTX: "https://rinkeby.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://rinkeby.etherscan.io/address/[[address]]",
  chainID: 4,
  isTestNetwork: true,
  currencyName: "RIN",
  node: "wss://nodes.mewapi.io/ws/rinkeby",
};
export default rinkebyNode;
