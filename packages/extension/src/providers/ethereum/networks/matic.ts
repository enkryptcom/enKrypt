import rarible from "@/libs/nft-handlers/rarible";
import { ProviderName } from "@/types/provider";
import { SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
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
  icon: require("./icons/matic.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#53CBC9",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  coingeckoID: "matic-network",
  NFTHandler: rarible,
};
maticNode.api = async () => {
  const api = new API(maticNode.node);
  await api.init();
  return api;
};
export default maticNode;
