import { ProviderName } from "@/types/provider";
import { SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import { EthereumNodeType } from "../types";
import createIcon from "../libs/blockies";
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
  icon: require("./icons/eth.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#C4C4C4",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  identicon: createIcon,
  basePath: "m/44'/60'/0'/0",
};
goerliNode.api = async () => {
  const api = new API(goerliNode.node);
  await api.init();
  return api;
};
export default goerliNode;
