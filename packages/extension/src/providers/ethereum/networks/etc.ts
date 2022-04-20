import { ProviderName } from "@/types/provider";
import { SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import { EthereumNodeType } from "../types";
import createIcon from "../libs/blockies";
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
  icon: require("./icons/etc.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#53CBC9",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  coingeckoID: "ethereum-classic",
  identicon: createIcon,
};
etcNode.api = async () => {
  const api = new API(etcNode.node);
  await api.init();
  return api;
};
export default etcNode;
