import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import { EthereumNodeType } from "../types";
import createIcon from "../libs/blockies";
const rinkebyNode: EthereumNodeType = {
  name: NetworkNames.Rinkeby,
  name_long: "Rinkeby",
  homePage: "https://www.rinkeby.io/",
  blockExplorerTX: "https://rinkeby.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://rinkeby.etherscan.io/address/[[address]]",
  chainID: 4,
  isTestNetwork: true,
  currencyName: "RIN",
  node: "wss://nodes.mewapi.io/ws/rinkeby",
  icon: require("./icons/eth.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#C4C4C4",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  identicon: createIcon,
  basePath: "m/44'/60'/0'/0",
};
rinkebyNode.api = async () => {
  const api = new API(rinkebyNode.node);
  await api.init();
  return api;
};
export default rinkebyNode;
