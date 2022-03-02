import { EthereumNodeType } from "../types";
const kovanNode: EthereumNodeType = {
  name: "KOV",
  name_long: "KOVAN",
  homePage: "https://github.com/kovan-testnet",
  blockExplorerTX: "https://kovan.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://kovan.etherscan.io/address/[[address]]",
  chainID: 42,
  isTestNetwork: true,
  currencyName: "KOV",
  node: "wss://nodes.mewapi.io/ws/kovan",
};
export default kovanNode;
