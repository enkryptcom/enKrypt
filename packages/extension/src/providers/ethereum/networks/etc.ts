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
};
export default etcNode;
