import { ProviderName } from "@/types/provider";
import { SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import { EthereumNodeType } from "../types";
import createIcon from "../libs/blockies";
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
  signer: [SignerType.secp256k1],
  gradient: "#E6007A",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  identicon: createIcon,
  basePath: "m/44'/60'/0'/0",
};
kovanNode.api = async () => {
  const api = new API(kovanNode.node);
  await api.init();
  return api;
};
export default kovanNode;
