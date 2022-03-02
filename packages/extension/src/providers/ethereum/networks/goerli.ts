import { EthereumNodeType } from "../types";
const goerliNode: EthereumNodeType = {
  name: "GOERLI",
  name_long: "Goerli",
  homePage: "https://github.com/goerli/testnet",
  blockExplorerTX: "https://goerli.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://goerli.etherscan.io/address/[[address]]",
  chainID: 5,
  isTestNetwork: true,
  currencyName: "GöETH",
  node: "wss://nodes.mewapi.io/ws/goerli",
};
export default goerliNode;
