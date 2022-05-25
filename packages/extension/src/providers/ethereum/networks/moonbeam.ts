import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import { EthereumNodeType } from "../types";
import createIcon from "../libs/blockies";
const moonbeamNode: EthereumNodeType = {
  name: NetworkNames.Moonbeam,
  name_long: "Moonbeam",
  homePage: "https://moonbeam.network",
  blockExplorerTX: "https://moonscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://moonscan.io/address/[[address]]",
  chainID: 1284,
  isTestNetwork: false,
  currencyName: "GLMR",
  node: "wss://wss.api.moonbeam.network/",
  icon: require("./icons/moonbeam.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#8247E5",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  coingeckoID: "moonbeam",
  identicon: createIcon,
  basePath: "m/44'/60'/0'/0",
};
moonbeamNode.api = async () => {
  const api = new API(moonbeamNode.node);
  await api.init();
  return api;
};
export default moonbeamNode;
