import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import { EthereumNodeType } from "../types";
import createIcon from "../libs/blockies";
const moonriverNode: EthereumNodeType = {
  name: NetworkNames.Moonriver,
  name_long: "Moonriver",
  homePage: "https://moonbeam.network/networks/moonriver/",
  blockExplorerTX: "https://moonriver.moonscan.io//tx/[[txHash]]",
  blockExplorerAddr: "https://moonriver.moonscan.io/[[address]]",
  chainID: 1285,
  isTestNetwork: false,
  currencyName: "MOVR",
  node: "wss://wss.api.moonriver.moonbeam.network",
  icon: require("./icons/moonriver.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#f2b606",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  coingeckoID: "moonriver",
  identicon: createIcon,
  basePath: "m/44'/60'/0'/0",
};
moonriverNode.api = async () => {
  const api = new API(moonriverNode.node);
  await api.init();
  return api;
};
export default moonriverNode;
